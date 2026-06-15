---
name: update-smelter-ts-docs
description: >
  Maintenance skill for updating the smelter-ts-docs Claude Code skill to reflect
  changes in the Smelter TypeScript SDK documentation. Detects what changed in the
  docs since the last sync, maps each change to the matching skill reference file,
  and applies minimal targeted updates in place (git is the review/undo mechanism).
---

# Update Smelter TS SDK Skill

Updates the downstream `smelter-ts-docs` skill so it reflects changes in this repo's
TypeScript SDK docs. Updates are **minimal and targeted** — change only what the docs
changed — and applied **in place** (git is the review/undo mechanism).

> This document is organized as: **What you're maintaining** → **Inputs & preconditions**
> → **Concepts** (each cross-cutting concern defined once) → **Workflow** (thin, ordered
> steps that point back to the concepts). When a step says "per the Examples concept",
> that concept section is the single source of truth — do not re-decide it inline.

## What You're Maintaining

`smelter-ts-docs` is a Claude Code skill consumed by a **coding agent writing Smelter
TypeScript SDK code** — typically with no web access to these docs. It is an actionable
API reference, NOT a marketing site or a verbatim doc mirror. It lives in a **different
repo** from this website.

Preserve its shape on every update:

- **SKILL.md is a thin index/router** — overview tables and pointers into `references/**`.
  Detail lives in reference files (progressive disclosure). Do not inflate SKILL.md with
  prose that belongs in a reference file.
- **Optimize for "what does an agent need to write correct code"**: signatures, props,
  types, defaults, constraints, runtime availability, and minimal usage. Drop tutorial
  throat-clearing, motivation, and prose that doesn't change what code an agent writes.
- **Condense, don't transcribe.** When unsure how much to keep, keep what changes the code
  the consuming agent produces; cut the rest.

These are the tie-breakers for every "how much?" judgment below (how much to condense, how
much of an example to include, whether a doc warrants a reference file).

## Inputs & Preconditions

The user MUST provide:

1. **Existing skill directory** — path to the downstream skill (contains `SKILL.md` and
   `references/`).
2. **Target version** — the SDK version the skill is being updated for (e.g. `0.5`).
   Major.minor granularity (minor-level for `0.x`). If missing, ask before proceeding.

Preconditions — verify before doing any work; STOP if any fails:

- **Docs present**: TS SDK docs are at `src/content/docs/ts-sdk/` in *this* repo. If absent,
  ask the user for the correct docs location.
- **Skill exists**: the skill directory contains a `SKILL.md`. If not, tell the user the
  skill was not found and STOP.
- **Skill repo is a clean git tree**: edits are made in place, so the skill directory must be
  a git repo with nothing uncommitted — otherwise the post-edit diff can't isolate this run's
  changes.
  ```bash
  git -C <skill-dir> rev-parse --is-inside-work-tree   # must succeed
  git -C <skill-dir> status --porcelain                # must be empty
  ```
  Not a repo → STOP (no safe in-place baseline; user can `git init` + commit). Dirty → STOP and
  ask the user to commit or stash first.
- **Right docs branch**: this repo keeps released docs on `main` and unreleased docs on `next`
  (versioned snapshots under `versions/**` are frozen). Make sure the checkout matches the
  version you're updating for; a sync marker recorded on one branch diffed against another
  branch's HEAD produces a misleading diff (see the Sync marker concept).

## Concepts

Each concept below is the **single source of truth** for one cross-cutting concern. The
workflow steps reference these by name.

### The `sources:` map

Every reference file declares which doc(s) it is derived from, in a `sources:` frontmatter
list. Paths are **relative to `src/content/docs/`**:

```yaml
---
sources:
  - ts-sdk/components/image.mdx
---
```

- A file may list **multiple** sources (a consolidated reference) or **one** (1:1).
- From these lists, build the reverse map **doc path → reference file(s)**. This is what turns
  "doc X changed" into "edit reference file Y" — a lookup, not a guess.
- **Path normalization**: `git diff` emits repo-root-relative paths
  (`src/content/docs/ts-sdk/components/image.mdx`); `sources:` is relative to
  `src/content/docs/` (`ts-sdk/...`). Strip the `src/content/docs/` prefix before keying the
  map so the two sides match.
- **Maintain it**: add the doc path when creating a reference file; update it when a doc is
  renamed (`R`); drop the path when a doc is removed (`D`); backfill it whenever bootstrap
  matching was used (below).
- **Bootstrap (first run / fallback)**: a reference file with no `sources:` block — or any
  full-read run where no map exists yet — requires matching docs to skill files by **content**
  (topic, component names, type definitions, subject matter), NOT filename or directory
  structure. Record the result as a `sources:` block so future runs are pure lookups.
- The doc's own frontmatter (`title:` etc.) is stripped during conversion, but the reference
  file's `sources:` frontmatter is skill metadata — never strip it.

### The Sync Marker (`synced_from`)

The downstream `SKILL.md` frontmatter records the docs-repo commit it was last generated from:

```yaml
synced_from: <full-git-sha>   # commit of THIS docs repo the skill was last synced to
```

- It is what makes change detection **incremental** instead of a full re-read.
- On each run: read it (Step 1), diff against it (Step 2), and write the current docs-repo
  `HEAD` back into it at the end (Step 4). Always write it — including on first run, where you
  add the field.
- Validity: the recorded SHA must be an ancestor of `HEAD` on the current branch. If it isn't
  (rebased history, or a cross-branch checkout), the diff is unreliable — fall back to a full
  read.

### Examples and `<Code>` Snippets

The canonical `## Usage` snippets are **not inline** in the `.mdx`. They are imported from a
separate file and rendered via `<Code>`:

```mdx
import imageExample from './examples/Image.tsx?raw';
<Code code={imageExample} title='ImageExample.tsx' lang='tsx' collapse={["12-33"]} />
```

How to handle them:

- **Resolving**: to get the real code, follow the matching `import … from './…tsx?raw'` and
  read that `.tsx` file. (These `examples/*.tsx` files are not docs in their own right, but they
  *are* the source of the snippets.)
- **Reverse direction** (a changed `examples/Foo.tsx` surfaced by the diff): find which page
  imports it, then map that page through the `sources:` map.
  ```bash
  grep -rl "Foo.tsx?raw" src/content/docs/ts-sdk/
  ```
- **Never copy the file in full** — include only the **slice relevant to the section's point**:
  the lines showing the API/props being documented.
  - The doc's `collapse={[...]}` ranges mark lines the page treats as boilerplate (imports,
    scaffolding, setup) — drop those first; the un-collapsed lines are the salient ones.
  - Strip setup/scaffolding unless the setup is itself what the section teaches.
  - Prefer a short excerpt (often just the component/hook call plus the props in question); use
    `// ...` to elide.
  - Use more of the example only when the full example genuinely *is* the lesson (end-to-end
    guides).
- **When a change is worth reflecting**: re-evaluate the snippet only if the change touches the
  **salient slice** the skill actually quotes. Changes confined to elided/boilerplate regions —
  or to example files the skill doesn't quote — are skipped. The skill does not mirror examples
  in full.

### MDX → Markdown Conversion

Strip all Astro/MDX artifacts from doc content before incorporating it into a (Markdown) skill
file:

| MDX | Markdown |
|---|---|
| `<Aside>text</Aside>` | `> **Note**: text` |
| `<Aside type="caution">` | `> **Caution**: text` |
| `<Aside type="tip">` | `> **Tip**: text` |
| `<Badge text="X" />` | `X` (inline) |
| `<Code code={importedVar} lang="tsx" />` | Resolve + trim per the Examples concept |
| inline ` ```tsx … ``` ` (code already in the `.mdx`) | Keep as-is |
| `<CollapsibleDetails>` | Remove wrapper, keep content |
| `<Steps>` | Plain numbered list |
| `<Tabs><TabItem>` | Pick the most relevant, or split into sections |
| `[Link](/path)` | Plain text, with `— see references/...` if it maps to a reference file |
| `import …` | Remove |
| Doc YAML frontmatter (`title:` …) | Remove — but keep the reference file's own `sources:` |

Type definitions stay as fenced code blocks. Preserve existing skill wording where the meaning
is unchanged even if the docs rephrase; never copy doc prose verbatim.

### Versioning & Compatibility Tables

Each runtime reference file (`references/runtimes/nodejs.md`, `web-client.md`, `web-wasm.md`)
ends with a `## Compatibility` table that MUST contain **exactly one row** for the current
target version (SDK version, server version, React version, browser support). Never leave stale
rows or add a second row.

The target version is **user-supplied and authoritative**, so it is applied **unconditionally** —
even when the git diff surfaced no change in the runtime docs. (A version bump often isn't a doc
text change; do not let the incremental diff skip it.) Refresh the single row from the doc
sources / the user-provided target on every run.

## Workflow

Steps are ordered; each is intentionally thin and defers to the Concepts above.

### Step 1 — Read the existing skill

Read `SKILL.md` and every file under `references/`. Note its structure, style, and altitude —
**match that altitude; do not re-pitch the skill.** If `SKILL.md`'s own description states a
materially different purpose or audience than "What You're Maintaining", defer to it and tell the
user about the mismatch.

While reading, build the **`sources:` reverse map** and read the **`synced_from` marker** (note
its absence if missing). Flag any reference file lacking a `sources:` block — it needs bootstrap
matching.

### Step 2 — Detect changed docs (git diff)

Read and re-diff **only what changed**, not the whole tree.

If a valid `synced_from` SHA exists:

```bash
git diff -M --name-status <synced_from-sha>..HEAD -- src/content/docs/ts-sdk/
```

- `A` / `M` → docs to read and diff against their reference file(s).
- `R` → renamed doc; update its `sources:` path (not a content change).
- `D` → removed doc; flag for the user (do NOT auto-delete the reference).
- **Empty output** → nothing changed since last sync; report "no changes" and STOP.
- This compares committed state only; if the docs have relevant *uncommitted* edits, note it and
  read the working tree too.

If there is no marker, or it's not an ancestor of `HEAD` (per the Sync marker concept), fall back
to reading **all** `.mdx` under `src/content/docs/ts-sdk/`.

Record the current docs-repo `HEAD` (`git rev-parse HEAD`) for Step 4 to write back. Handle any
changed `examples/*.tsx` per the Examples concept.

### Step 3 — Map changes to reference files

Resolve each changed doc to its target reference file via the **`sources:` reverse map** (apply
the path normalization). Found → edit that file. Not found → a new topic, create a reference file
in Step 4 and give it a `sources:` entry. Use bootstrap matching only where no mapping exists.

### Step 4 — Identify changes, confirm, then apply

Determine the actual content deltas for each changed doc vs its reference file: new/removed/changed
props, types, parameters, options, defaults, descriptions; new or removed topics; compatibility-table
version changes.

Report findings and **ask the user to confirm before editing**:

```
## Changes Detected
### New (not in current skill):
- …
### Modified:
- file: what changed
### Removed (flagged, not auto-deleted):
- …
```

On confirmation, edit the skill files **in place**, changing ONLY what's needed so untouched files
stay byte-for-byte identical. Apply:

- **MDX → Markdown conversion** per that concept.
- **Examples** per that concept.
- **`sources:` maintenance** per that concept (add/update/drop/backfill).
- **Versioning & compatibility tables** per that concept (always refresh the one row).
- **SKILL.md**: update tables only for added/removed/materially-changed entries; update reference
  pointers for new files; write the recorded `HEAD` into `synced_from`.
- New reference files follow the format and style of their sibling files; cross-references use
  `— see references/path/File.md`.

### Step 5 — Verify and summarize (via git)

Review the exact change set with git — this is what replaces eyeballing a copy:

```bash
git -C <skill-dir> status        # modified + newly created (untracked) files
git -C <skill-dir> add -N .      # so new files appear in the diff
git -C <skill-dir> diff
git -C <skill-dir> grep -nE '<Aside|<Badge|<Code|<CollapsibleDetails|<Tabs|<TabItem|<Steps|\?raw|^import '
```

Confirm from the diff:

1. No MDX/Astro artifacts remain (the grep returns nothing).
2. All `references/` cross-links resolve to real files.
3. The diff is small and surgical — a large diff on a supposedly "unchanged" file means something
   got rewritten that shouldn't have.
4. No accidental removals or duplications; SKILL.md tables match the actual reference files.
5. `SKILL.md` `synced_from:` is the current docs-repo `HEAD`.
6. Every created/modified reference file has an accurate `sources:` block, and every `sources:`
   path resolves to an existing doc (except paths intentionally dropped for removed docs).

Leave the changes **uncommitted** for the user to review and commit — do NOT commit or push.
Report: files created, files modified, any ambiguities, and `git -C <skill-dir> diff` to review.
