import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import type { EditorHandle } from "./Editor";
import {
  type PlaygroundSession,
  SessionUnavailableError,
  closeSession,
  createSession,
  fetchAssets,
  resetSession,
  sendHeartbeat,
} from "./api";
import { DEFAULT_CODE } from "./defaultCode";
import type { LogLevel, WhipInputKind, WorkerRequest, WorkerResponse } from "./protocol";
import RuntimeWorker from "./runtime.worker?worker";
import { type WebRtcSession, startWhepPlayback, startWhipPublishing } from "./webrtc";

const Editor = lazy(() => import("./Editor"));

const STORAGE_KEY = "smelter-playground:code";
const HEARTBEAT_INTERVAL_MS = 10_000;
const MAX_LOG_ENTRIES = 500;
const PREVIEW_CONNECT_ATTEMPTS = 5;

type LogEntry = { id: number; level: LogLevel | "system"; message: string };

type SessionState =
  | { status: "connecting" }
  | { status: "ready"; session: PlaygroundSession }
  | { status: "unavailable"; message: string };

function loadDraft(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CODE;
  } catch {
    return DEFAULT_CODE;
  }
}

function saveDraft(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Storage unavailable (private mode, blocked site data), drafts are best-effort.
  }
}

export default function Playground() {
  const [sessionState, setSessionState] = useState<SessionState>({ status: "connecting" });
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [whipActive, setWhipActive] = useState<Record<WhipInputKind, boolean>>({
    camera: false,
    screen: false,
  });
  const [mp4s, setMp4s] = useState<string[]>([]);
  const [initialCode] = useState(loadDraft);

  const session = sessionState.status === "ready" ? sessionState.session : undefined;
  const codeRef = useRef(initialCode);
  const editorRef = useRef<EditorHandle>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const workerRef = useRef<Worker>();
  const previewRef = useRef<WebRtcSession>();
  // `rtc` is missing until the worker registers the input and returns its bearer token.
  const whipRef = useRef<
    Partial<Record<WhipInputKind, { stream: MediaStream; rtc?: WebRtcSession }>>
  >({});
  const logIdRef = useRef(0);
  const logsRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<number>();

  const log = useCallback((level: LogEntry["level"], message: string) => {
    const entry = { id: logIdRef.current++, level, message };
    setLogs((prev) => [...prev.slice(-(MAX_LOG_ENTRIES - 1)), entry]);
  }, []);

  useEffect(() => {
    const logsElement = logsRef.current;
    if (logsElement) {
      logsElement.scrollTop = logsElement.scrollHeight;
    }
  });

  const stopPreview = useCallback(() => {
    previewRef.current?.close();
    previewRef.current = undefined;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const connectPreview = useCallback(
    async (whepUrl: string) => {
      stopPreview();
      for (let attempt = 1; attempt <= PREVIEW_CONNECT_ATTEMPTS; attempt++) {
        try {
          const rtc = await startWhepPlayback(whepUrl, (stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          });
          previewRef.current?.close();
          previewRef.current = rtc;
          return;
        } catch (err) {
          if (attempt === PREVIEW_CONNECT_ATTEMPTS) {
            log("system", `Failed to connect the preview: ${(err as Error).message}`);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
    },
    [log, stopPreview]
  );

  const postToWorker = useCallback((request: WorkerRequest) => {
    workerRef.current?.postMessage(request);
  }, []);

  // Stops publishing locally, without touching the input registered by the worker.
  const releaseWhip = useCallback((kind: WhipInputKind) => {
    const active = whipRef.current[kind];
    if (active) {
      active.rtc?.close();
      active.stream.getTracks().forEach((track) => track.stop());
      delete whipRef.current[kind];
    }
    setWhipActive((prev) => ({ ...prev, [kind]: false }));
  }, []);

  const stopWhip = useCallback(
    (kind: WhipInputKind) => {
      releaseWhip(kind);
      postToWorker({ type: "unregister-whip", kind });
    },
    [releaseWhip, postToWorker]
  );

  const publishWhip = useCallback(
    async (kind: WhipInputKind, bearerToken: string) => {
      const active = whipRef.current[kind];
      if (!session || !active) {
        return;
      }
      active.rtc?.close();
      active.rtc = undefined;
      try {
        const rtc = await startWhipPublishing(session.whipUrls[kind], bearerToken, active.stream);
        if (whipRef.current[kind] === active) {
          active.rtc = rtc;
          log("system", `Input "${kind}" is live.`);
        } else {
          rtc.close();
        }
      } catch (err) {
        log("system", `Failed to publish "${kind}": ${(err as Error).message}`);
        stopWhip(kind);
      }
    },
    [session, log, stopWhip]
  );

  const startWhip = useCallback(
    async (kind: WhipInputKind) => {
      if (!workerRef.current) {
        log("system", `Run the code before sharing the ${kind}.`);
        return;
      }
      try {
        const stream =
          kind === "camera"
            ? await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true,
              })
            : await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        whipRef.current[kind] = { stream };
        setWhipActive((prev) => ({ ...prev, [kind]: true }));
        stream.getVideoTracks()[0]?.addEventListener("ended", () => stopWhip(kind));
        postToWorker({ type: "register-whip", kind });
      } catch (err) {
        log("system", `Failed to start "${kind}": ${(err as Error).message}`);
      }
    },
    [stopWhip, postToWorker, log]
  );

  const terminateWorker = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = undefined;
    setRunning(false);
    // The inputs the media was published to go away with the worker's session.
    for (const kind of Object.keys(whipRef.current) as WhipInputKind[]) {
      releaseWhip(kind);
    }
  }, [releaseWhip]);

  const run = useCallback(() => {
    if (!session) {
      return;
    }
    if (!workerRef.current) {
      const worker = new RuntimeWorker();
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data;
        if (message.type === "log") {
          log(message.level, message.message);
        } else if (message.type === "output-registered") {
          void connectPreview(session.whepUrl);
        } else if (message.type === "run-finished") {
          setRunning(false);
        } else if (message.type === "whip-registered") {
          void publishWhip(message.kind, message.bearerToken);
        } else if (message.type === "whip-failed") {
          log("system", `Failed to register "${message.kind}": ${message.message}`);
          releaseWhip(message.kind);
        }
      };
      // Errors the worker can't report itself, e.g. failing to load.
      worker.onerror = (event) => {
        log("error", `Playground runtime crashed: ${event.message || "unknown error"}`);
        terminateWorker();
      };
      workerRef.current = worker;
    }
    setRunning(true);
    const request: WorkerRequest = {
      type: "run",
      smelterUrl: session.smelterUrl,
      code: codeRef.current,
    };
    workerRef.current.postMessage(request);
  }, [session, log, connectPreview, terminateWorker, publishWhip, releaseWhip]);

  const stop = useCallback(() => {
    terminateWorker();
    stopPreview();
    if (session) {
      void resetSession(session).catch(() => {});
    }
    log("system", "Stopped.");
  }, [session, terminateWorker, stopPreview, log]);

  // Session lifecycle: create, keep alive with heartbeats, close on leave.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `sessionAttempt` is the trigger for creating a new session
  useEffect(() => {
    let cancelled = false;
    let current: PlaygroundSession | undefined;
    let heartbeat: number | undefined;

    setSessionState({ status: "connecting" });
    createSession()
      .then((created) => {
        if (cancelled) {
          closeSession(created);
          return;
        }
        current = created;
        setSessionState({ status: "ready", session: created });
        heartbeat = window.setInterval(() => {
          sendHeartbeat(created).catch((err) => {
            if (err instanceof SessionUnavailableError) {
              window.clearInterval(heartbeat);
              setSessionState({
                status: "unavailable",
                message: "The playground session has expired.",
              });
            }
          });
        }, HEARTBEAT_INTERVAL_MS);
      })
      .catch((err) => {
        if (!cancelled) {
          setSessionState({
            status: "unavailable",
            message:
              err instanceof SessionUnavailableError
                ? "All playground sessions are in use, try again in a moment."
                : `Can't reach the playground server: ${(err as Error).message}`,
          });
        }
      });

    const onPageHide = () => current && closeSession(current);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      cancelled = true;
      window.clearInterval(heartbeat);
      window.removeEventListener("pagehide", onPageHide);
      if (current) {
        closeSession(current);
      }
    };
  }, [sessionAttempt]);

  // Release everything bound to a session when it goes away.
  useEffect(() => {
    if (!session) {
      return;
    }
    return () => {
      terminateWorker();
      stopPreview();
    };
  }, [session, terminateWorker, stopPreview]);

  // Run the code as soon as a session is available.
  const runRef = useRef(run);
  runRef.current = run;
  useEffect(() => {
    if (session) {
      runRef.current();
    }
  }, [session]);

  useEffect(() => {
    fetchAssets()
      .then((assets) => setMp4s(assets.mp4s))
      .catch(() => {});
  }, []);

  const onCodeChange = useCallback((code: string) => {
    codeRef.current = code;
    window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => saveDraft(code), 500);
  }, []);

  const resetCode = useCallback(() => {
    editorRef.current?.setValue(DEFAULT_CODE);
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-4 lg:flex-row">
      <div className="flex min-h-[60vh] min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-white/25 lg:min-h-0">
        <div className="flex items-center justify-between border-white/25 border-b px-4 py-2 text-sm text-white/75">
          <span>App.tsx</span>
          <button type="button" className="hover:text-white" onClick={resetCode}>
            Reset to example
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <Suspense fallback={<div className="p-4 text-sm text-white/50">Loading editor…</div>}>
            <Editor
              ref={editorRef}
              defaultValue={initialCode}
              onChange={onCodeChange}
              onRun={run}
            />
          </Suspense>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-white/25 bg-black">
          <video ref={videoRef} autoPlay playsInline controls muted className="h-full w-full" />
          {sessionState.status !== "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/75 p-8 text-center text-white">
              {sessionState.status === "connecting" ? (
                <span>Connecting to the playground server…</span>
              ) : (
                <>
                  <span>{sessionState.message}</span>
                  <button
                    type="button"
                    className="rounded bg-demos-button px-4 py-2 text-demos-buttonText"
                    onClick={() => setSessionAttempt((attempt) => attempt + 1)}>
                    Start new session
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            disabled={!session}
            className="rounded bg-demos-button px-4 py-2 text-demos-buttonText disabled:opacity-50"
            onClick={run}
            title="Ctrl/Cmd + Enter">
            {running ? "Running…" : "Run"}
          </button>
          <button
            type="button"
            disabled={!session}
            className="rounded border border-white/25 px-4 py-2 text-white disabled:opacity-50"
            onClick={stop}>
            Stop
          </button>
          <span className="mx-2 h-6 w-px bg-white/25" />
          {(["camera", "screen"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              disabled={!session}
              className={`rounded border px-4 py-2 disabled:opacity-50 ${
                whipActive[kind]
                  ? "border-demos-button text-demos-button"
                  : "border-white/25 text-white"
              }`}
              onClick={() => (whipActive[kind] ? stopWhip(kind) : void startWhip(kind))}>
              {whipActive[kind]
                ? `Stop ${kind}`
                : kind === "camera"
                  ? "Share camera"
                  : "Share screen"}
            </button>
          ))}
        </div>

        {mp4s.length > 0 && (
          <p className="break-words text-sm text-white/50">
            MP4 files:{" "}
            {mp4s.map((file) => (
              <code key={file} className="mr-2 inline-block text-white/75">
                {file}
              </code>
            ))}
          </p>
        )}

        <div className="flex min-h-48 flex-1 flex-col overflow-hidden rounded-lg border border-white/25">
          <div className="flex items-center justify-between border-white/25 border-b px-4 py-2 text-sm text-white/75">
            <span>Console</span>
            <button type="button" className="hover:text-white" onClick={() => setLogs([])}>
              Clear
            </button>
          </div>
          <div ref={logsRef} className="flex-1 overflow-auto p-4 font-mono text-xs">
            {logs.map((entry) => (
              <pre
                key={entry.id}
                className={`whitespace-pre-wrap break-words ${
                  entry.level === "error"
                    ? "text-red-400"
                    : entry.level === "warn"
                      ? "text-yellow-300"
                      : entry.level === "system"
                        ? "text-purple-300"
                        : "text-white/90"
                }`}>
                {entry.message}
              </pre>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
