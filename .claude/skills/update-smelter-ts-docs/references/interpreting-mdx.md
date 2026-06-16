# Interpreting the source MDX

The website docs are `.mdx`: Markdown plus a small set of Starlight/Astro components.
It's tempting to treat the move into the skill as a tag-for-tag translation —
`<Badge>` becomes this string, `<Aside>` becomes that string — and produce a
paragraph-by-paragraph copy of each page. **Don't.** That yields a transcription, and
a transcription is a worse reference than the website it copied: longer to read, no
added insight, and no reason to exist as a skill.

Instead, **read each construct as a signal about what kind of information it carries**,
then re-express that information in the skill's own structure and voice — synthesized,
reordered, and trimmed for an agent that's trying to write working code. The MDX tags
are scaffolding for a web page; what you're after is the meaning underneath.

## What each construct is telling you

Use this to *understand* the source, not as a substitution table. The right-hand
column is the meaning to carry over — how you phrase it in the skill is your call.

| MDX construct | What it signals | What to do with it |
|---|---|---|
| `<Badge text="Node.js" />` | Runtime availability — this input/output/option only works on certain runtimes | This is real API information. Make availability unmistakable in the skill (a short, consistent phrasing works), because it determines what the agent can actually call where. |
| `<Aside type="caution">` / `tip` / default | A constraint, gotcha, or important nuance the docs author chose to elevate | Almost always worth keeping — these are the "things that bite you." Fold the point into your prose or call it out; don't lose it in a flat copy. |
| `<CollapsibleDetails summaryTitle='Type definitions'>` | **The authoritative type/signature** for the API | This is the API surface — the part the website is the source of truth for. Reproduce the type accurately. An agent benefits from seeing it directly, so present it plainly (not hidden). |
| `<CollapsibleDetails>` with an `<img>`/example output | A visual result, meaningful to a human reader | An agent can't see it. Drop it, or replace with one sentence only if the visual conveys API behavior worth stating. |
| `<Code code={x} ... collapse={[...]} />` | An example, whose real code lives in a sibling `examples/*.tsx?raw` file | Read the actual `.tsx`. Then include the part that illustrates the point — not necessarily all of it. The `collapse` ranges are the website's display choice; make your own. |
| ` ```tsx {4-6} collapse={10-20} ` | An inline example with line-highlight/collapse hints | Keep the code, drop the `{…}`/`collapse={…}` directives — they're rendering hints with no meaning in plain text. |
| `<Tabs><TabItem label="npm">…` (package managers) | The same instruction repeated per tool | One representative case (npm) is enough; the rest is noise in a reference. |
| `<Tabs><TabItem label="Node.js">…<TabItem label="Browser">` | Genuinely *different* content per runtime | All of it matters — surface each branch (e.g. as labeled subsections) so nothing is hidden behind a tab the agent won't click. |
| `<Steps>` | An ordered procedure | The wrapper is decoration; the ordered list is the content. |
| `import … from '@assets/...'` + `<img>`/`<video>` | Illustrative media | Doesn't translate to text. Drop it; if a diagram encodes structure, state that structure in a sentence. |
| Internal links like `/ts-sdk/components/view` | A pointer to related API, valid only on the website | The website's URL space doesn't exist in the skill. Refer to the thing by name, or cross-reference the skill's own section. Never leave a dead `/ts-sdk/...` link. |
| Frontmatter (`title`, `sidebar`) | Page metadata for the site's navigation | Not content. The title may become a heading; the rest is dropped. |

## Distillation never trims the API

Before the distillation guidance below, one hard boundary: **"distill" applies to
prose and examples, never to the API surface.** Every prop, property, argument, enum
value, and default the SDK exposes must appear in the skill — completely. You may
compress the *explanation* of a prop to a tight line; you may not omit the prop. The
same goes for components, hooks, inputs, outputs, encoders, and resources: all of them
are documented. A shorter reference is good; an *incomplete* one is broken, because an
agent will assume an undocumented option doesn't exist.

## Distill, don't mirror

With API completeness as a fixed constraint, the two things the skill should do that a
transcription can't:

- **Reorganize for the reader's task.** The website is paginated for browsing; the
  skill is read top-to-bottom (or grepped) by an agent mid-task. Group what belongs
  together, lead with the common case, and cut the navigational glue ("see the page
  below", "in the next section").
- **Keep the API exact, compress the prose.** Type definitions, prop names, defaults,
  and availability must be precise — that's the whole point of a reference. The
  surrounding explanation can usually be tighter than the website's, which is written
  to teach a newcomer browsing a site.

## Worked example — a reference page

This shows interpretation, not a template to apply mechanically. Source
(`ts-sdk/components/View.mdx`, abbreviated):

```mdx
---
title: View
---
import { Aside, Code } from '@astrojs/starlight/components';
import viewExample from './examples/View.tsx?raw';

The `View` component serves as the core layout mechanism..., similar to the `<div>` tag.

## Usage
<Code code={viewExample} title='ViewExample.tsx' lang='tsx' collapse={["16-37"]} />

## Reference
<CollapsibleDetails summaryTitle='Type definitions' open>
```tsx
type ViewProps = { id?: string; children?: ReactNode; style?: ViewStyleProps; transition?: Transition; }
```
</CollapsibleDetails>

## Props
### style
View styling properties.
- **Type**: [`ViewStyleProps`](/ts-sdk/components/props/view-style-props)
```

Reading it: the intro is the *purpose*, the `<Code>` points to real example code, the
`<CollapsibleDetails>` holds the *authoritative type*, the Props list is the *API
surface*. Carried into the skill (your phrasing may differ — what matters is the
information is exact and the shape serves the agent):

````md
## View

The core layout container, analogous to a `<div>`. Holds children and basic styling.

```tsx
type ViewProps = {
  id?: string;
  children?: ReactNode;
  style?: ViewStyleProps;     // see ViewStyleProps
  transition?: Transition;    // see Transition
};
```

Example:

```tsx
import { View } from "@swmansion/smelter";
// ...the lines from examples/View.tsx that actually show layout, not all the setup
```
````

The type is reproduced exactly; the prose is compressed; the `/ts-sdk/...` link became
a plain cross-reference; the example was pulled from the real `.tsx` and trimmed.

## Worked example — a guide (trim hard)

Guides such as `quick-start.mdx` are long and branchy: multiple `<CollapsibleDetails>`
showing every alternative output protocol, several `collapse` ranges per step. A
transcription would reproduce all of it. Don't. A guide's value is the *flow* — the
ordered path from nothing to a working app. Keep that spine and one canonical code
path; mention the alternatives in a line rather than reproducing each variant, because
the per-input/per-output reference sections already cover them in full.
