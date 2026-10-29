// Playground API exposed by the demo backend (smelter-demo repo, `/playground`).
// Only local development is supported for now.
import type { WhipInputKind } from "./protocol";

export const PLAYGROUND_API_URL = "http://localhost:3001/playground";

export type PlaygroundSession = {
  sessionId: string;
  smelterUrl: string;
  whepUrl: string;
  whipUrls: Record<WhipInputKind, string>;
};

export class SessionUnavailableError extends Error {}

async function request<T>(method: string, route: string, keepalive = false): Promise<T> {
  const response = await fetch(`${PLAYGROUND_API_URL}${route}`, { method, keepalive });
  const body = await response.json().catch(() => ({}));
  if (response.status === 503 || response.status === 404) {
    throw new SessionUnavailableError(body.error ?? `Request failed (${response.status})`);
  }
  if (!response.ok) {
    throw new Error(body.error ?? body.message ?? `Request failed (${response.status})`);
  }
  return body as T;
}

export async function createSession(): Promise<PlaygroundSession> {
  const body = await request<{
    sessionId: string;
    smelterPath: string;
    whepUrl: string;
    whipUrls: Record<WhipInputKind, string>;
  }>("POST", "/session");
  return {
    sessionId: body.sessionId,
    smelterUrl: new URL(body.smelterPath, PLAYGROUND_API_URL).toString(),
    whepUrl: body.whepUrl,
    whipUrls: body.whipUrls,
  };
}

export async function sendHeartbeat(session: PlaygroundSession): Promise<void> {
  await request("POST", `/session/${session.sessionId}/heartbeat`);
}

export function closeSession(session: PlaygroundSession) {
  void request("DELETE", `/session/${session.sessionId}`, true).catch(() => {});
}

// Removes everything the playground code registered, same as a fresh run would.
export async function resetSession(session: PlaygroundSession): Promise<void> {
  await fetch(`${session.smelterUrl}/api/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
}

export async function fetchAssets(): Promise<{ mp4s: string[] }> {
  return await request("GET", "/assets");
}
