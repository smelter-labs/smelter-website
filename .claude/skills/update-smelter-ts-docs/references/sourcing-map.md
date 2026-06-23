# Sourcing map

What to read from the website (`src/content/docs/`) and how it maps onto the
`smelter-ts-docs` skill. The website is the API source of truth; this map keeps you
from pulling in content that doesn't belong in a TypeScript SDK reference.

## Hard skips (the only binary exclusions)

- `versions/**` — frozen snapshots of released docs. Never source from here; the
  unversioned `ts-sdk/**` already holds the current content.
- `http-api/**` — the HTTP server is a different SDK. Out of scope.

Everything else is a **judgment call per page and per change**, not a fixed
allow/deny list. The question to ask of any page or paragraph is: *would this help
someone build or deploy a TypeScript SDK app?* If yes, include it (distilled); if it's
purely site-navigational, server-internal, or irrelevant to SDK users, leave it out.

## TypeScript SDK — `ts-sdk/**` (the core)

Everything here is in scope. Rough mapping to skill sections (adapt to the skill's
actual layout — it may group these differently, and that's fine):

| Website path | Feeds skill content about |
|---|---|
| `ts-sdk/overview.mdx` | top-level intro, package landscape, input/output lists |
| `ts-sdk/components/*.mdx` (+ `examples/*.tsx`) | `View`, `Tiles`, `Rescaler`, `Text`, `Image`, `Mp4`, `InputStream`, `Show`, `SlideShow`, `Shader`, `WebView` |
| `ts-sdk/components/props/*.mdx` | shared style/prop types (`ViewStyleProps`, `TextStyleProps`, `Transition`, `EasingFunction`, …) |
| `ts-sdk/hooks/*.mdx` (+ `examples/*.tsx`) | `useInputStreams`, `useAudioInput`, `useAfterTimestamp`, `useBlockingTask` |
| `ts-sdk/inputs/*.mdx` | input types (`mp4`, `rtmp`, `rtp`, `hls`, `whip`, `whep`, `v4l2`, and the `wasm-*` browser inputs) |
| `ts-sdk/outputs/*.mdx` | output types (`mp4`, `rtmp`, `rtp`, `hls`, `whip`, `whep`, `wasm-*`) — one file each; each lists the encoders it accepts and cross-references the encoder file (it does **not** inline encoder option tables) |
| `ts-sdk/outputs/encoders/*.mdx` | encoder options (`aac`, `opus`, `ffmpeg-h264`, `ffmpeg-vp8/vp9`, `vulkan-h264`) — **one skill file per encoder**, `references/outputs/encoders/<name>.md`, mapping 1:1 to the website file. A website encoder change → edit exactly that one skill file (no fan-out across outputs) |
| `ts-sdk/resources/*.mdx` | registerable resources (`image`, `shader`, `web-renderer`) |
| `ts-sdk/side-channel/*.mdx` | side-channel feature — **include `python.mdx`**: the Python side-channel SDK is used together with the TS SDK, so it belongs here |
| `ts-sdk/guides/*.mdx` | task-oriented walkthroughs — **trim hard** (see interpreting-mdx) |
| `ts-sdk/nodejs/*.mdx` | Node.js runtime: `Smelter`, `OfflineSmelter`, `SmelterManager` |
| `ts-sdk/web-client/*.mdx` | Browser (Client) runtime |
| `ts-sdk/web-wasm/*.mdx` | Browser (WASM) runtime |

Runtime availability matters throughout: inputs/outputs are gated per runtime with
`<Badge>` markers (Node.js / Browser (Client) / Browser (WASM)). Preserve that
information — it tells the agent what actually works where.

## Common concepts — `fundamentals/**` (cherry-pick)

Include the parts a TS SDK app developer needs; they explain *why* the API is shaped
the way it is.

- `fundamentals/getting-started.mdx` — orientation, setup paths. Include the TS-SDK-
  relevant parts.
- `fundamentals/setup-choices.mdx` — trade-offs between Node.js / Browser / WASM /
  standalone. Useful for "which package do I use" decisions.
- `fundamentals/glossary.mdx` — terminology (offline vs live processing, timestamps,
  inputs/outputs/resources). Good shared vocabulary for the skill.
- `fundamentals/concepts/layouts.mdx` — sizing rules, absolute vs static positioning.
  Essential context for the layout components.
- `fundamentals/concepts/shaders.mdx` — needed alongside the `Shader` component/resource.

Skip the parts that are purely about running a standalone server with no SDK.

## Deployment — `deployment/**` (mostly in scope)

A TS SDK user running the default `LocallySpawnedInstanceManager`, or connecting to a
server they manage, still has to deploy the Smelter binary somewhere it can run.
Include the operational knowledge they need:

- Server setup, configuration, and the requirements/variants for running the binary.
- How the SDK connects to or spawns that binary.

Treat the rest as a **matter of scale**, not a yes/no. Bulk benchmark tables and
performance pages don't belong inlined — they go stale and don't help someone *write*
code. But a single high-signal takeaway from them often does: e.g. one sentence that
GPU encoding is dramatically faster than CPU, so an agent steers toward the right
encoder/hardware. Include the distilled insight, not the data dump. Use judgment about
how much is worth carrying for each page.

## Following example imports

Reference and guide pages rarely inline their code. They do:

```tsx
import viewExample from './examples/View.tsx?raw';
...
<Code code={viewExample} title='ViewExample.tsx' lang='tsx' collapse={["16-37"]} />
```

The real, type-checked code is in `ts-sdk/<section>/examples/*.tsx`. Read that file to
get the snippet. Treat those `.tsx` files as authoritative for example code — they're
compiled in CI, so they're correct. Don't reconstruct examples from memory.
