---
name: update-ts-docs-skill
description: >
  Create or update the downstream `smelter-ts-docs` Claude Code skill from this repo's
  Smelter TypeScript SDK documentation. Extracts the SDK-relevant API surface from the
  Astro/Starlight docs, condenses it into the skill's own reference schema, refreshes
  factual content while preserving hand-authored guidance, and tracks what was synced via
  a single manifest file. Use when the docs changed and the end-user skill needs to catch
  up, or when bootstrapping a new SDK-docs skill. Do NOT auto-invoke — only on explicit
  request.
---

# Maintain the Smelter TS SDK Skill

This repo (`smelter-website`) is the **source of truth**: Smelter docs as Astro/Starlight
`.mdx`. The **downstream skill** (`smelter-ts-docs`, in the separate `smelter-labs/skills`
repo) is a condensed, Markdown-only reference that a **coding agent** loads while writing
Smelter TypeScript SDK code. This skill is the procedure for keeping that downstream skill
in sync with these docs — or creating it from scratch.

> Organized as: **What you're maintaining** → **Inputs & preconditions** → **Scope** →
> **Target format** → **Concepts** (each cross-cutting rule defined once) → **Workflows**
> (create / update) → **Verification**. Workflow steps defer to the Concepts; those are the
> single source of truth — don't re-decide a rule inline.

## What You're Maintaining

`smelter-ts-docs` is consumed by an **agent writing Smelter TS SDK code**, usually with no
web access to these docs. It is an actionable API reference, NOT a doc mirror. Three layers,
treated differently (see the Editorial concept):

1. **Factual reference** — components, props, hooks, inputs, outputs, resources, runtimes.
   Mechanically derived from docs; this skill owns it.
2. **Editorial guidance** — the curated SKILL.md index: "when to use" columns, defaults
   ("use Tiles by default for multiple inputs"), decision tables. Hand-authored judgment.
3. **Production patterns** (`patterns.md`) — drawn from real projects, not from these docs.

The skill is **not a format-preserving transform** of the docs. Doc pages and skill files
use *different* schemas (see Target format). You are re-authoring into the skill's schema and
condensing, not stripping MDX off a page.

## Inputs & Preconditions

Resolve before starting; STOP if a hard precondition fails:

- **Docs repo** — this repo. The **only** sources are the unversioned current docs:
  `src/content/docs/ts-sdk/**` and the SDK-relevant common dirs (`fundamentals/**`, the
  SDK-touching parts of `deployment/**`). **Never read `src/content/docs/versions/**`** — those
  are frozen per-version snapshots and are not a source. The current docs describe one version
  (latest released on `main`, or unreleased on `next`); `targetVersion` is that version. Confirm
  the branch matches the version you intend to document.
- **Downstream skill repo** — default `/home/wojtek/smelter/skills/smelter-skills/skills/<skill>`
  (the `smelter-ts-docs` skill dir). Confirm the path with the user if it's not there.
- **Target version** — the SDK major.minor the skill should document (e.g. `0.4`). If not
  given, infer from this repo (latest released version on `main`, or `package.json` / the docs'
  Compatibility tables) and confirm.
- **Mode** — *update* (skill exists) or *create* (bootstrapping). Pick the matching workflow.
- **Clean git tree (update mode)** — edits are in place; the skill repo must be a git repo
  with nothing uncommitted, so the post-edit `git diff` isolates this run:
  ```bash
  git -C <skill-dir> rev-parse --is-inside-work-tree   # must succeed
  git -C <skill-dir> status --porcelain                # must be empty
  ```
  Not a repo or dirty → STOP and tell the user.

## Scope — What To Include

Goal: everything an agent needs to **write Smelter TS SDK code**, nothing else.

| Doc area | Include? |
|---|---|
| `ts-sdk/**` | **Yes, all** — the core API surface (components, props, hooks, inputs, outputs, resources, runtimes, configuration, guides). |
| `fundamentals/**` | **Selectively** — concepts an SDK author needs: layouts, shaders, how-it-works, setup-choices, glossary. Skip pure-marketing or non-SDK framing. |
| `deployment/**` | **Selectively, and don't undervalue it** — an SDK author often has to *run* the server they connect to, especially with `web-client` (external server) and even `web-wasm`/`node` (env, GPU/codec, binary configuration). Include server **setup**, **configuration**, and the deployment **variants** (binaries, Docker, ts-sdk-node) — they're needed to get an app running and to **debug** runtime failures even if never surfaced to the end user. Performance/benchmark pages: include the parts that explain real constraints (codecs, GPU, WASM limits); skip pure marketing numbers. |
| `http-api/**` | **No** — out of scope for this skill (it's the HTTP server, not the TS SDK). |
| `versions/**` | **No, never** — frozen per-version snapshots, not a source. Read only the unversioned current docs. |
| Non-SDK integrations | **No** — anything for a different consumer (e.g. a Membrane plugin) is irrelevant to a TS SDK user. |

**Heuristic for the gray areas**: include a page if it helps an agent **build, run, configure,
or debug** a Smelter TS SDK app — including standing up and troubleshooting the server the SDK
connects to. Knowledge the agent uses only internally to diagnose a failure still counts, even
if it's never shown to the user. Exclude a page only when it targets a *different consumer* (the
HTTP API as its own surface, a non-SDK integration like a Membrane plugin) or is pure marketing.
When genuinely unsure, list the page and ask.

Guides (`ts-sdk/guides/**`, e.g. quick-start, transitions, web-rendering) are not mirrored
1:1 — they feed the SKILL.md "Core Concept" snippet, the runtime setup, and candidate
`patterns.md` entries. Treat them as editorial source, not reference pages.

## Target Format (the downstream skill's schema)

Match this exactly — in *create* mode you produce it; in *update* mode you edit within it.

**`SKILL.md`** — a thin, curated **index/router**, not detail:
- Frontmatter: `name`, a `description` rich with trigger phrases ("smelter", "@swmansion/smelter",
  RTMP streaming, video composition in React, …).
- Intro one-liner; a **"Version mismatch"** block stating the documented version (`^X.Y.Z`)
  and pointing to `references/update.md`; a **"Core Concept"** JSX snippet.
- A **"Runtime Packages — Choose One"** table (`@swmansion/smelter-node` /
  `-web-client` / `-web-wasm`) with "use when".
- Grouped overview tables (Layout / Media / Utility components; Props; Hooks; Inputs; Outputs;
  Resources; Patterns), each row carrying a **terse summary + "when to use"**, followed by
  `→ references/...` pointers. Detail never lives in SKILL.md.

**`references/`** files, each in its own schema:
- `components/<Name>.md` → `# <Name> Component` → short intro → `## Type Definition` (fenced
  `tsx`) → `## Props` (each `### prop` with `- **Type**:`, `- **Default**:`) → `## Key Behaviors`
  (bullet list distilled from doc prose + `<Aside>` constraints).
- `props/<Name>.md` → `# <Name>` → type block → `## Properties`.
- `hooks/<Name>.md` → `# <name> Hook` → signature → `## Returns` / type → `## Example`.
- `inputs.md` / `outputs.md` → consolidated single file: intro → `## Table of Contents` (each
  entry tagged with runtime availability) → `## Common Options` → one `## <Type>` section per
  input/output with a `tsx` type block and inline runtime/`default` annotations.
- `resources.md` → consolidated registerImage/Shader/WebRenderer/Font.
- `runtimes/{nodejs,web-client,web-wasm}.md` → setup + instance managers + ends with a
  `## Compatibility` table holding **exactly one row** (SDK version, Smelter server, React).
  Per-runtime server concerns live here: `nodejs.md` = the auto-spawned binary + its config;
  `web-client.md` = how to deploy/connect to the external server it talks to; `web-wasm.md` =
  browser/WASM constraints (codecs, Chrome-only, GPU).
- `deployment.md` → consolidated server **setup / configuration / deployment variants**
  (binaries, Docker, ts-sdk-node) and the real runtime constraints (codecs, GPU, WASM limits)
  an agent needs to run and **debug** a Smelter app. Add this file when the source material
  warrants it; link it from SKILL.md and the relevant `runtimes/*.md`.
- `patterns.md` → production patterns (human-owned; see Editorial).
- `update.md` → version-mismatch resolution instructions (references `npx skills` + `vMAJOR.MINOR`
  tags). Update version strings here when the target version changes.

## Concepts

Single source of truth for each cross-cutting rule. Workflows reference these by name.

### Extraction & Condensation

For each in-scope doc page, pull the **facts an agent needs to write correct code** and
re-author them into the matching Target-format schema:
- Type definitions → keep as fenced `tsx` blocks (from the doc's `## Reference` /
  `<CollapsibleDetails>` type block).
- Props/properties → from the doc's `## Props`/`## Properties` (`**Type**`, `**Default value**`,
  `**Option availability**`) into the skill's `- **Type**:` / `- **Default**:` form.
- Runtime availability → from `<Badge text="Node.js|Browser (Client)|Browser (WASM)" />` rows
  into inline tags / "Runtime" columns / the inputs-outputs TOC annotations.
- Constraints and gotchas (often in `<Aside>`) → distilled into `## Key Behaviors` bullets.
- **Condense, don't transcribe.** Drop tutorial prose, motivation, and anything that doesn't
  change the code an agent writes. Prefer the skill's existing wording where meaning is unchanged.

### Examples Handling

`## Usage` snippets in docs are **imported**, not inline:
```mdx
import imageExample from './examples/Image.tsx?raw';
<Code code={imageExample} lang='tsx' collapse={["12-33"]} />
```
- Resolve the `?raw` import and read that `.tsx` to get real code.
- A changed `examples/*.tsx` surfaced by a diff → find its importer and map that page:
  `grep -rl "Foo.tsx?raw" src/content/docs/ts-sdk/`.
- **Never copy an example in full.** Include only the slice that illustrates the API/props in
  question; `collapse={[...]}` ranges mark boilerplate to drop first; elide with `// ...`. Use a
  fuller example only when the example *is* the lesson.

### MDX → Text Conversion

When carrying doc text into a Markdown skill file: `<Aside>`→`> **Note/Caution/Tip**:`;
`<Badge text="X"/>`→inline `X`; `<CollapsibleDetails>`→drop wrapper, keep content;
`<Tabs>/<TabItem>`→pick the relevant one or split; `<Steps>`→numbered list; `import …` and the
doc's `title:` frontmatter→remove; internal `/slug` links→plain text (or `→ references/...` when
they map to a reference file). No MDX/Astro tags survive into the skill.

### Editorial Layer Policy

- **New content** (a doc/topic with no skill counterpart) → synthesize the editorial layer too:
  write its overview-table row with a sensible "when to use", place it in the right group, add
  reference pointers. Derive guidance from the docs; keep it terse and code-relevant.
- **Existing content** → **preserve** hand-authored guidance, defaults, and decision-table
  wording. Only rewrite editorial when the docs changed *significantly* (semantics/defaults
  changed, a recommendation is now wrong) — not for cosmetic doc edits.
- **`patterns.md`** is production-derived, not in these docs. Do not regenerate it. Only touch a
  pattern if an API it uses changed enough to break it; otherwise flag for the user.

### Change Plan & Approval Gate

**No file is created or edited until the user approves a top-level plan.** This applies to
*both* workflows — it is the hard boundary between analysis and writing.

Present a concise, scannable summary (counts + grouped lists, not full diffs):

```
## Sync Plan — smelter-ts-docs → target v<X.Y> (docs @ <branch> <short-sha>)

New reference files (N):
- references/components/Foo.md  ← ts-sdk/components/foo.mdx
Modified (N):
- references/inputs.md — added `whip_server` options; RTMP marked experimental
- references/runtimes/nodejs.md — Compatibility bumped 0.3.0→0.4.0
Editorial (SKILL.md):
- regenerate: <new rows>  |  preserve: <untouched groups>
Flagged for you (no auto-change):
- references/components/Bar.md — source doc deleted; confirm removal
- references/patterns.md — Shader API changed; pattern may need a human look
Out of scope / skipped:
- http-api/*, deployment/variants/docker.mdx, <non-SDK pages>
```

Then STOP and ask for confirmation. Only on approval proceed to writing. In *create* mode the
plan is the proposed file layout + which parts are generated editorial vs doc-derived.

### The Sync Manifest

A single file at the skill root — `sync-manifest.json` — is the provenance record (it is not
skill content the consuming agent loads). It holds:
```jsonc
{
  "targetVersion": "0.4",
  "syncedFromRepo": "smelter-website",
  "syncedFromBranch": "main",
  "syncedFromCommit": "<full-sha>",   // commit of THIS docs repo at last sync
  "map": {
    "references/components/Image.md": ["ts-sdk/components/image.mdx"],
    "references/inputs.md": ["ts-sdk/inputs/mp4.mdx", "ts-sdk/inputs/rtp.mdx", "..."]
  },
  "generated": ["references/patterns.md"]  // files NOT doc-derived; skip on factual sync
}
```
- `map` keys are skill files; values are doc paths **relative to `src/content/docs/`**. `git diff`
  emits repo-root paths — strip the `src/content/docs/` prefix to match.
- Drives incremental updates: diff docs since `syncedFromCommit`, map each changed doc back to its
  skill file(s) via `map`, edit only those.
- Maintain it every run: add entries for new files, update paths on doc renames, drop entries for
  removed docs, and write the current docs `HEAD` + `targetVersion` back at the end.
- Validity: `syncedFromCommit` must be an ancestor of `HEAD` on the current branch; if not
  (rebase / cross-branch), fall back to a full re-derive.

### Versioning & Compatibility

`targetVersion` is **user-supplied / inferred and authoritative**. Apply it unconditionally,
even if no runtime doc changed in the diff (a version bump often isn't a doc-text change):
- Refresh the single `## Compatibility` row in each `runtimes/*.md` (SDK / Smelter server / React)
  from the docs' Compatibility tables.
- Update the `^X.Y.Z` strings in SKILL.md's "Version mismatch" block and in `update.md`.

## Workflow A — Update an Existing Skill

1. **Read the skill + manifest.** Read `SKILL.md`, all of `references/`, and `sync-manifest.json`
   (note its absence). Learn the structure and altitude; match it.
2. **Detect changed docs.** With a valid `syncedFromCommit`:
   ```bash
   git diff -M --name-status <syncedFromCommit>..HEAD -- \
     src/content/docs/ts-sdk src/content/docs/fundamentals src/content/docs/deployment \
     ':(exclude)src/content/docs/versions/**'
   ```
   Keep only in-scope paths (per Scope; `versions/**` is never in scope). `A`/`M` → update; `R` → fix `map` path; `D` → flag (don't
   auto-delete). Empty (in-scope) diff → report "no changes" and STOP. No/invalid manifest commit →
   full re-derive against current docs. Record current `HEAD`. Handle changed `examples/*.tsx` per
   the Examples concept.
3. **Map → skill files** via the manifest `map` (apply path normalization). Unmapped changed doc =
   new topic → new reference file in step 5.
4. **Identify deltas, then present the Change Plan.** For each mapped pair, determine
   new/removed/changed props, types, defaults, behaviors, runtime availability, and
   compatibility-version changes. Present the **Change Plan & Approval Gate** and STOP. Do not
   edit anything until approved.
5. **Apply in place** (only after approval) per the concepts: Extraction & Condensation, Examples, MDX→Text, Editorial
   (preserve existing / synthesize new), Versioning (always refresh compatibility + version
   strings). Update `SKILL.md` index rows/pointers only where entries materially changed. Update
   `sync-manifest.json` (`map`, `syncedFromCommit`, `targetVersion`).
6. **Verify** (see Verification).

## Workflow B — Create a New Skill

1. **Inventory in-scope docs** (per Scope) and decide the file layout: one `components/<Name>.md`
   and `props/<Name>.md` per component/props page; one `hooks/<Name>.md` per hook; consolidated
   `inputs.md`, `outputs.md`, `resources.md`; one `runtimes/*.md` per runtime package; `update.md`.
   Leave `patterns.md` for humans (stub it or omit).
2. **Present the Change Plan** (proposed file layout + generated-editorial vs doc-derived split)
   and STOP for approval. Do not write any files until approved.
3. **Author the reference files** (only after approval) in Target format using the Extraction,
   Examples, and MDX→Text concepts. Build the `map` as you go.
4. **Author `SKILL.md`** as the curated index: description with triggers, version-mismatch block,
   Core Concept snippet, runtime "Choose One" table, grouped overview tables with synthesized
   "when to use", and `→ references/...` pointers. This is the editorial layer — write it.
5. **Write `sync-manifest.json`** (`targetVersion`, branch, current `HEAD`, full `map`, `generated`).
6. **Verify**, then suggest seeding `evals/<skill>/evals.json` (see Verification).

## Verification

- **No MDX/Astro artifacts** leaked in: `git -C <skill-dir> grep -nE '<Aside|<Badge|<Code|<CollapsibleDetails|<Tabs|<TabItem|<Steps|\?raw|^import '` returns nothing.
- **Cross-links resolve** — every `→ references/...` points to a real file; every manifest `map`
  source path resolves to an existing doc (except ones intentionally dropped).
- **Diff is surgical** (update mode) — review `git -C <skill-dir> diff` (after `git add -N .` so new
  files show). A large diff on a supposedly unchanged file means something was over-rewritten.
- **Compatibility** — each `runtimes/*.md` has exactly one Compatibility row; SKILL.md / `update.md`
  version strings match `targetVersion`.
- **Eval gate (don't skip for shipping):** the skills repo requires eval before merge. Point the
  user at its process — load Anthropic's `skill-creator`, run `evals/<skill>/evals.json`, target a
  90–100% pass rate, suggest new evals for newly covered features. Do not commit/push; leave changes
  for the user to review (`git -C <skill-dir> diff`) and report files created/modified + any
  ambiguities.
