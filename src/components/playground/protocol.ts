export type WhipInputKind = "camera" | "screen";

export type WorkerRequest =
  | { type: "run"; smelterUrl: string; code: string }
  // Camera/screen inputs are registered through the SDK, so that hooks like
  // `useInputStreams` see them; the page publishes the media to them.
  | { type: "register-whip"; kind: WhipInputKind }
  | { type: "unregister-whip"; kind: WhipInputKind };

export type LogLevel = "log" | "info" | "warn" | "error";

export type WorkerResponse =
  | { type: "log"; level: LogLevel; message: string }
  // The preview output was (re)registered, so the WHEP player has to reconnect.
  | { type: "output-registered" }
  | { type: "run-finished" }
  // Sent again after every session restart, the previous WHIP session is gone by then.
  | { type: "whip-registered"; kind: WhipInputKind; bearerToken: string }
  | { type: "whip-failed"; kind: WhipInputKind; message: string };
