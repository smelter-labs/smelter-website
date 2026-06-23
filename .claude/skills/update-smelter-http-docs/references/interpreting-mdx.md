# Interpreting the source MDX

The website docs are `.mdx`: Markdown plus a small set of Starlight/Astro components.
It's tempting to treat the move into the skill as a tag-for-tag translation — `<Aside>`
becomes that string, `<CollapsibleDetails>` becomes this block — and produce a
paragraph-by-paragraph copy of each page. **Don't.** That yields a transcription, and a
transcription is a worse reference than the website it copied: longer to read, no added
insight, and no reason to exist as a skill.

Instead, **read each construct as a signal about what kind of information it carries**,
then re-express that information in the skill's own structure and voice — synthesized,
reordered, and trimmed for an agent that's trying to write working HTTP requests. The MDX
tags are scaffolding for a web page; what you're after is the meaning underneath.

## What each construct is telling you

Use this to *understand* the source, not as a substitution table. The right-hand column is
the meaning to carry over — how you phrase it in the skill is your call.

| MDX construct | What it signals | What to do with it |
|---|---|---|
| `<CollapsibleDetails summaryTitle='Type definitions'>` | **The authoritative type/shape** of a request body or sub-type | This is the API surface — what the website is source of truth for. Reproduce the type accurately (snake_case fields; `f32`/`f64`/`u32`/`bool`/`string` exactly as written). Present it plainly under a `## Type` heading, not hidden. |
| `<CollapsibleDetails summaryTitle='Example request'>` | A representative `POST` with a JSON body | Keep one canonical request as the `## Usage` block. Don't reproduce every alternative-protocol variant — the per-output reference covers those. |
| `<CollapsibleDetails summaryTitle='Example output'>` with an `<img>`/text | A visual result, meaningful to a human reader | An agent can't see it. Drop it (or replace with one sentence only if it states API behavior). |
| `<Aside type="caution">` / `tip` / default | A constraint, gotcha, or important nuance the docs author elevated | Almost always worth keeping — "things that bite you" (e.g. "exactly one of `url`/`path`", "MP4 must be unregistered to flush metadata"). Fold into prose or a `> **Note:**`/`> ⚠️ **Caution:**` line; don't lose it. |
| `<Badge text="Required feature: gpu-video" />` | A **build/feature requirement** for an option | Real API information — there's no per-runtime axis here, but features and env-var gates matter. State it plainly (e.g. "Requires the `gpu-video` build feature", "Requires `SMELTER_WEB_RENDERER_ENABLE=true`"). |
| `<Steps>` | An ordered procedure (guides) | The wrapper is decoration; the ordered list is the content. Keep the spine, trim the branches. |
| `<Tabs><TabItem label="npm">…` (package managers / variants) | The same instruction repeated per tool | One representative case is enough; the rest is noise in a reference. |
| `import … from '@assets/...'` + `<img>`/`<video>` | Illustrative media | Doesn't translate to text. Drop it; if a diagram encodes structure (e.g. the shader vertex layout), state that structure in a sentence. |
| Internal links like `/http-api/outputs/mp4` or `/deployment/configuration` | A pointer to related API, valid only on the website | The website's URL space doesn't exist in the skill. Cross-reference the skill's own file (`outputs/mp4.md`, `deployment.md`) or refer to the thing by name. Never leave a dead `/http-api/...` or `/deployment/...` link. |
| `http` code fences (`POST: /api/...`) | The route's method + path + headers | Keep them — they're the literal request line. Pair with the JSON body. |
| Frontmatter (`title`, `sidebar`) | Page metadata for site navigation | Not content. The title may become a heading; the rest is dropped. |
| A **compatibility table** (multi-version: server ↔ SDK ↔ codecs) | History across *all* releases — a website concern | The skill is pinned to **one** server version, so don't reproduce the table. State only the single version this skill targets. A historical table in a version-specific skill is just stale rows waiting to mislead. |

## Distillation never trims the API

Before the distillation guidance below, one hard boundary: **"distill" applies to prose
and examples, never to the API surface.** Every field, property, enum value, default,
route, and event the server exposes must appear in the skill — completely. You may
compress the *explanation* of a field to a tight line; you may not omit the field. The
same goes for components, inputs, outputs, encoders, resources, routes, and events: all of
them are documented. A shorter reference is good; an *incomplete* one is broken, because an
agent will assume an undocumented field doesn't exist.

## Distill, don't mirror

With API completeness as a fixed constraint, the two things the skill should do that a
transcription can't:

- **Reorganize for the reader's task.** The website is paginated for browsing; the skill is
  read top-to-bottom (or grepped) by an agent mid-task. Group what belongs together, lead
  with the common case, and cut the navigational glue ("see the page below", "in the next
  section").
- **Keep the API exact, compress the prose.** Type definitions, field names, defaults, and
  feature requirements must be precise — that's the whole point of a reference. The
  surrounding explanation can usually be tighter than the website's, which is written to
  teach a newcomer browsing a site.

## Worked example — a reference page

Source (`http-api/components/View.mdx`, abbreviated) carries: an intro (purpose), a
`## Usage` update request, `## Positioning`/`## Transitions` prose, a `## Reference` type
block, and a `## Properties` list, plus nested `Transition`/`BoxShadow`/`EasingFunction`
types. Carried into the skill (phrasing may differ — what matters is the information is
exact and the shape serves the agent):

````md
# View

The core layout container, analogous to an HTML `<div>`. Used inside a scene (the
`video.root` component tree of an output).

## Usage

```http
POST: /api/output/:output_id/update
Content-Type: application/json

{ "video": { "root": { "type": "view", "children": [ ... ] } } }
```

## Type

```tsx
type View = {
  type: "view";
  id?: string;
  children?: Component[];
  width?: f32;
  ...
}
```

## Properties
### width
Width in pixels.
- **Type**: `f32`
...every field...
````

The type is reproduced exactly (snake_case, `f32`); the prose is compressed; the
`/http-api/...` links became plain cross-references; the example output image was dropped.
Note the `type` discriminant (`"view"`) is made explicit even where the website's type
block omits it — the JSON body requires it.

## Worked example — a guide (trim hard)

Guides such as `quick-start.mdx` are long and branchy: a `<Steps>` flow with several
`<CollapsibleDetails>` showing every alternative output protocol per step. A transcription
would reproduce all of it. Don't. A guide's value is the *flow* — the ordered path from
nothing to a working composition. Keep that spine and one canonical request path; mention
the alternatives in a line rather than reproducing each variant, because the
per-input/per-output reference sections already cover them in full.
