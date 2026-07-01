# Sourcing map

What to read from the website (`src/content/docs/`) and how it maps onto the
`smelter-http-api-docs` skill. The website is the API source of truth; this map keeps you
from pulling in content that doesn't belong in an HTTP API reference.

## Hard skips (the only binary exclusions)

- `versions/**` — frozen snapshots of released docs. Never source from here; the
  unversioned `http-api/**` already holds the current content.
- `ts-sdk/**` — the TypeScript SDK is a **different** SDK with its own skill
  (`smelter-ts-docs`, maintained by `update-smelter-ts-docs`). Out of scope. Do not pull
  React-component / `@swmansion/...` content into the HTTP skill.

Everything else is a **judgment call per page and per change**, not a fixed allow/deny
list. The question to ask of any page or paragraph is: *would this help someone configure
or drive a Smelter server over HTTP?* If yes, include it (distilled); if it's purely
site-navigational, TS-SDK-specific, or irrelevant to HTTP API users, leave it out.

## HTTP API — `http-api/**` (the core)

Everything here is in scope. Rough mapping to skill sections (adapt to the skill's actual
layout — it may group these differently, and that's fine):

| Website path | Feeds skill content about |
|---|---|
| `http-api/overview.mdx` | top-level intro, the scene/component model, the input/output/resource lists |
| `http-api/routes.mdx` | `references/routes.md` — every HTTP route (method, path, body) |
| `http-api/events.mdx` | `references/events.md` — every WebSocket event |
| `http-api/components/*.mdx` | `View`, `Tiles`, `Rescaler`, `Text`, `Image`, `InputStream`, `Shader`, `WebView` |
| `http-api/inputs/*.mdx` | input types (`mp4`, `rtp`, `hls`, `whip`, `whep`, `rtmp`, `decklink`, `v4l2`) |
| `http-api/outputs/*.mdx` | output types (`mp4`, `rtp`, `hls`, `whip`, `whep`, `rtmp`) — one file each; each lists the encoders it accepts and cross-references the encoder file (it does **not** inline encoder option tables) |
| `http-api/outputs/encoders/*.mdx` | encoder options (`ffmpeg-h264`, `vulkan-h264`, `ffmpeg-vp8`, `ffmpeg-vp9`, `aac`, `opus`) — **one skill file per encoder**, `references/outputs/encoders/<name>.md`, mapping 1:1 to the website file. A website encoder change → edit exactly that one skill file (no fan-out across outputs) |
| `http-api/resources/*.mdx` | registerable resources (`image`, `shader`, `web-renderer`) |
| `http-api/side-channel/*.mdx` | side-channel feature — **include `python.mdx`**: the Python side-channel SDK is the only supported consumer, so it belongs here |
| `http-api/guides/*.mdx` | task-oriented walkthroughs — **trim hard** (see interpreting-mdx) |

Unlike the TS SDK, the HTTP server is a **single runtime** — there are no per-runtime
availability badges. What *does* matter and must be preserved:
- **Feature/build requirements**: e.g. `vulkan_h264` needs the `gpu-video` build feature;
  `WebView`/web-renderer needs `SMELTER_WEB_RENDERER_ENABLE=true`.
- **Experimental** markers (e.g. `decklink`, `v4l2`).
- **`schedule_time_ms`** semantics on the mutating routes (value `0` = the start request).

## Common concepts — `fundamentals/**` (cherry-pick)

Include the parts an HTTP API user needs; they explain *why* the API is shaped the way it
is.

- `fundamentals/concepts/layouts.mdx` — sizing rules, absolute vs static positioning.
  Essential context for the layout components; feeds `references/overview.md`.
- `fundamentals/concepts/shaders.mdx` — needed alongside the `Shader` component/resource
  (WGSL header, base params, entry points).
- `fundamentals/glossary.mdx` — terminology (offline vs live processing, timestamps,
  inputs/outputs/resources, offset, required). Good shared vocabulary.
- `fundamentals/getting-started.mdx` / `setup-choices.mdx` — orientation; include only the
  standalone-server-relevant parts.

Skip the parts that are purely about the TypeScript/Membrane SDKs.

## Deployment — `deployment/**` (mostly in scope)

An HTTP API user has to run the Smelter server binary somewhere. Include the operational
knowledge they need, feeding `references/deployment.md`:

- `deployment/setup.mdx`, `deployment/variants/docker.mdx`, `deployment/variants/binaries.mdx`
  — how to get and run the server (Docker images, GPU passthrough, requirements).
- `deployment/configuration.mdx` — the `SMELTER_*` environment variables. This one is
  **HTTP-API-critical** (it governs ports, web rendering, side-channel dir, WHIP/WHEP/RTMP
  servers, offline processing) — keep it complete.

Treat the benchmark/performance pages as a **matter of scale**, not yes/no. Bulk tables
don't belong inlined — they go stale and don't help someone *write* requests. But a single
high-signal takeaway often does (e.g. "GPU encoding is dramatically faster than CPU").
Include the distilled insight, not the data dump.
