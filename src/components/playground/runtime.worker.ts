// Runs the playground code. It lives in a worker so that an infinite loop or a
// crash in user code can't freeze the page: the page simply terminates the
// worker and starts a new one.
import {
  React,
  ReactJsxRuntime,
  Smelter,
  SmelterSdk,
  transform,
} from "@smelter-website/playground-runtime";
import type { LogLevel, WhipInputKind, WorkerRequest, WorkerResponse } from "./protocol";

const OUTPUT_ID = "preview";

type UserModule = {
  App: React.ComponentType;
  setup?: (smelter: Smelter) => Promise<void> | void;
  setupSource: string;
};

const MODULES: Record<string, object> = {
  react: { ...React, default: React, __esModule: true },
  "react/jsx-runtime": ReactJsxRuntime,
  "@swmansion/smelter": { ...SmelterSdk, __esModule: true },
  "@swmansion/smelter-web-client": { default: Smelter, __esModule: true },
};

function post(message: WorkerResponse) {
  self.postMessage(message);
}

function formatValue(value: unknown): string {
  // Stacks point into the compiled code and SDK internals, so they don't help the user.
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

// Errors from the Smelter server are thrown by the SDK with the response body attached.
function formatError(err: unknown): string {
  const body = (err as { body?: { message?: string } } | undefined)?.body;
  if (body?.message) {
    return `${err instanceof Error ? err.message : "Error"}\n${body.message}`;
  }
  return formatValue(err);
}

for (const level of ["log", "info", "warn", "error"] as const satisfies LogLevel[]) {
  const original = console[level].bind(console);
  console[level] = (...args: unknown[]) => {
    original(...args);
    post({ type: "log", level, message: args.map(formatValue).join(" ") });
  };
}

self.addEventListener("error", (event) => {
  post({ type: "log", level: "error", message: formatError(event.error ?? event.message) });
});
self.addEventListener("unhandledrejection", (event) => {
  post({ type: "log", level: "error", message: formatError(event.reason) });
});

function loadUserModule(code: string): UserModule {
  const compiled = transform(code, {
    transforms: ["typescript", "jsx", "imports"],
    jsxRuntime: "automatic",
    production: true,
    filePath: "App.tsx",
  }).code;

  const require = (name: string) => {
    const module = MODULES[name];
    if (!module) {
      throw new Error(
        `Module "${name}" is not available in the playground. Available modules: ${Object.keys(MODULES).join(", ")}.`
      );
    }
    return module;
  };
  const exports: Record<string, unknown> = {};
  new Function("require", "exports", "module", compiled)(require, exports, { exports });

  if (typeof exports.default !== "function") {
    throw new Error("The code has to `export default` a React component.");
  }
  if (exports.setup !== undefined && typeof exports.setup !== "function") {
    throw new Error("`setup` export has to be a function.");
  }
  const setup = exports.setup as UserModule["setup"];
  return {
    App: exports.default as React.ComponentType,
    setup,
    setupSource: setup?.toString() ?? "",
  };
}

// The output is registered once with `Root`; later runs that keep the same
// `setup` only swap the component, so the preview stream is not interrupted.
let currentApp: { App: React.ComponentType; version: number } | undefined;
const appListeners = new Set<() => void>();

function setCurrentApp(App: React.ComponentType) {
  currentApp = { App, version: (currentApp?.version ?? 0) + 1 };
  appListeners.forEach((listener) => listener());
}

function subscribeApp(listener: () => void) {
  appListeners.add(listener);
  return () => appListeners.delete(listener);
}

type ErrorBoundaryState = { error?: Error };

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    const { View, Text } = SmelterSdk;
    if (this.state.error) {
      return React.createElement(
        View,
        { style: { backgroundColor: "#161127", padding: 40, direction: "column" } },
        React.createElement(Text, { style: { fontSize: 40, color: "#F24664" } }, "Render error"),
        React.createElement(
          Text,
          { style: { width: 1200, fontSize: 24, color: "#FFFFFF", wrap: "word" } },
          this.state.error.message
        )
      );
    }
    return this.props.children;
  }
}

function Root() {
  const app = React.useSyncExternalStore(subscribeApp, () => currentApp);
  if (!app) {
    return null;
  }
  return React.createElement(ErrorBoundary, { key: app.version }, React.createElement(app.App, {}));
}

let smelter: Smelter | undefined;
let activeSetupSource: string | undefined;
// Camera/screen inputs the page is publishing; re-registered whenever the session restarts.
const whipInputs = new Set<WhipInputKind>();

async function registerWhipInput(instance: Smelter, kind: WhipInputKind) {
  try {
    const handle = await instance.registerInput(kind, { type: "whip_server" });
    if (!handle.bearerToken) {
      throw new Error("Server did not return a bearer token.");
    }
    post({ type: "whip-registered", kind, bearerToken: handle.bearerToken });
  } catch (err) {
    whipInputs.delete(kind);
    post({ type: "whip-failed", kind, message: formatError(err) });
  }
}

async function run({ smelterUrl, code }: Extract<WorkerRequest, { type: "run" }>) {
  const userModule = loadUserModule(code);

  if (smelter && userModule.setupSource === activeSetupSource) {
    setCurrentApp(userModule.App);
    return;
  }

  // First run or `setup` changed: start from a clean session. `init()` resets
  // all resources this session registered on the server.
  if (smelter) {
    await smelter.terminate().catch(() => {});
    smelter = undefined;
  }
  activeSetupSource = undefined;
  const instance = new Smelter({ url: smelterUrl });
  await instance.init();
  smelter = instance;

  for (const kind of whipInputs) {
    await registerWhipInput(instance, kind);
  }
  await userModule.setup?.(instance);
  setCurrentApp(userModule.App);
  await instance.registerOutput(OUTPUT_ID, React.createElement(Root), {
    type: "whep_server",
    // Resolution and encoder are enforced by the server, these are placeholders.
    video: { resolution: { width: 1280, height: 720 }, encoder: { type: "ffmpeg_h264" } },
    audio: { encoder: { type: "opus" } },
  });
  activeSetupSource = userModule.setupSource;
  post({ type: "output-registered" });
}

async function handleRequest(request: WorkerRequest) {
  if (request.type === "run") {
    try {
      await run(request);
    } catch (err) {
      post({ type: "log", level: "error", message: formatError(err) });
    } finally {
      post({ type: "run-finished" });
    }
  } else if (request.type === "register-whip") {
    whipInputs.add(request.kind);
    if (!smelter) {
      whipInputs.delete(request.kind);
      post({ type: "whip-failed", kind: request.kind, message: "Run the code first." });
      return;
    }
    await registerWhipInput(smelter, request.kind);
  } else if (request.type === "unregister-whip") {
    whipInputs.delete(request.kind);
    await smelter?.unregisterInput(request.kind).catch(() => {});
  }
}

// Requests are handled one at a time, so e.g. a camera registered while a run
// is in progress lands in the session that run creates.
let queue = Promise.resolve();

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  queue = queue.then(() => handleRequest(request));
};
