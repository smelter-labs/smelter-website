---
name: update-smelter-ts-docs
description: >
  Update the `smelter-ts-docs` reference skill (in the smelter-labs/skills repo)
  from the Smelter website docs in this repo. Use whenever the user wants to sync,
  refresh, regenerate, port, or update the Smelter TypeScript SDK docs skill — for
  example after editing docs under src/content/docs/ts-sdk, after a new Smelter or
  SDK release, or when they say the docs skill is "out of date", "stale", or "behind
  the website". This skill reconciles existing skill content with the website rather
  than blindly overwriting it. It does NOT create the docs skill from scratch.
---

# Update the Smelter TS SDK docs skill

This website repo is the **source of truth for the Smelter API**. The
`smelter-ts-docs` skill (in the `smelter-labs/skills` repo) is a *distilled*,
self-contained reference an agent loads to build apps with the Smelter TypeScript
SDK **without** reading the website. Your job is to keep that skill in sync with the
website **without throwing away the work that made it a good skill**.

The hard part is that the skill is not a transcription of the website — sections may
have been reorganized, trimmed, merged, or annotated by hand. So you are
**reconciling**, not regenerating. The website wins on every API fact; the skill's
editorial shape and hand-written guidance are worth preserving unless they now
contradict the API.

## What this skill is and isn't

- It **updates** an existing `smelter-ts-docs` skill. It assumes that skill already
  exists with real content.
- It does **not** build the docs skill from scratch, and it does **not** try to
  bootstrap a missing one. If the target skill is missing or just an empty
  placeholder, **abort and surface that to the user**. Populating it from zero is
  out of scope here — don't attempt it.

## Step 0 — Locate the target repo

The docs skill lives at `smelter-skills/skills/smelter-ts-docs/` inside the
`smelter-labs/skills` repo (remote `git@github.com:smelter-labs/skills.git`).

1. Try the common local path `~/smelter/skills` first. Confirm it's the right repo by
   checking `git -C <path> remote -v` points at `smelter-labs/skills`.
2. If it's not there, search nearby (e.g. siblings of this website repo, `~/`,
   `~/code`, `~/projects`) for a clone whose remote matches.
3. If you still can't find it, **ask the user** for the path, or offer to clone it:
   `git clone git@github.com:smelter-labs/skills.git ~/smelter/skills`.

Confirm `smelter-ts-docs/SKILL.md` exists and has real content before doing anything
else. If it's missing or just a stub, **abort and tell the user** — don't try to
populate it. See *What this skill is and isn't*.

## Step 1 — Establish scope and version (ask the user first)

Don't guess what to sync. **Open by asking the user what changed.** Their answer puts
you in one of three modes:

- **Targeted** — "I added a `whep` input" / "the `Text` component got a new prop".
  Touch only the affected section(s). This is the most common and safest mode.
- **Release range** — "we just shipped Smelter v0.6 / SDK v0.4". Diff the website over
  the relevant commit range and sync everything that moved. Use
  `git log`/`git diff` against `src/content/docs/` to find what changed since the
  last sync (the version recorded in the skill is a good lower bound — see below).
- **Full pass** — "just reconcile everything". Walk every in-scope section.

Also **ask which Smelter / SDK version** this sync targets, and record it in the
skill (e.g. a compatibility line in `SKILL.md`) so future runs can tell how stale the
skill is and what commit range to diff from. Prefer syncing from the **`main`**
branch — it reflects released docs. `next` holds unreleased docs; only use it if the
user explicitly wants to sync ahead of a release.

## Step 2 — Decide what to read (and what to ignore)

The website is large and not all of it belongs in a TS SDK reference. The full
sourcing map — which directories feed which skill sections, and what to skip — is in
**`references/sourcing-map.md`**. Read it before selecting files. The short version:

- **Source from:** `ts-sdk/**` (components, props, hooks, inputs, outputs, encoders,
  resources, side-channel, guides, and the runtime dirs), plus the TS-relevant parts
  of `fundamentals/**` and `deployment/**`.
- **Never source from:** `src/content/docs/versions/**` (frozen snapshots) and
  `src/content/docs/http-api/**` (different SDK).
- Code examples usually live in sibling `examples/*.tsx` files imported with
  `?raw` — follow the import to the real file; don't copy the `<Code .../>` tag.

## Step 3 — Reconcile each affected section

For every section in scope, the goal is: **make the API correct, keep the good
writing.** The detailed rules and flagging heuristics are in
**`references/merge-strategy.md`** — read it before editing.

**The API must be 100% complete.** Distillation and judgment calls apply to *prose,
examples, guides, and supplementary content* — never to API coverage. Every
component, hook, input, output, encoder, and resource must be present, and within
each, **every prop/property/argument** must be documented (name, type, default,
runtime availability). "Trim hard" and "distill" mean *tighten the explanation*, not
*drop fields*. An agent relying on this skill must never be missing an API option the
SDK supports. The core loop:

1. **Extract the API surface from the website**: type definitions (the blocks inside
   `<CollapsibleDetails summaryTitle='Type definitions'>`), prop/argument names,
   defaults, return types, and runtime-availability badges.
2. **Compare with the existing skill section.** Where the skill states an API fact
   that differs from the website, the **website wins** — rewrite it.
3. **Preserve** everything that doesn't contradict the website: reorganized prose,
   added explanations, extra examples, cross-section patterns. This is the value a
   human added; don't flatten it back into a transcription.
4. **Flag, don't silently keep.** If preserved content doesn't directly contradict
   the website but has a *significant chance of being wrong now* (e.g. it describes
   behavior around a prop whose type just changed), surface it to the user instead of
   leaving it untouched.
5. **Re-express the source in the skill's own voice**, per
   **`references/interpreting-mdx.md`**. Read what each MDX construct (`<Badge>`,
   `<Aside>`, `<CollapsibleDetails>`, `<Code>`, `<Tabs>`, `<Steps>`, asset imports,
   links) is *telling* you, then carry that meaning across — don't transcribe the
   page tag-for-tag. The skill is a distilled reference, not a copy of the website.
6. **Extract example code judiciously.** Read the referenced `.tsx?raw` file, but
   include only the part that illustrates the point — not always the whole file.
   Reference pages can show fuller snippets (the boilerplate the website hides under
   `collapse` is often useful to an agent), but **guides are large** and should be
   trimmed hard to the steps and code that carry the lesson.

## Step 4 — Report what you changed

End with a concise summary so a human can review without re-reading everything:

- Which skill files you changed, and the **API facts** you corrected (old → new).
- A short list of **flags** — preserved content you suspect may now be wrong, and
  anything you couldn't confidently reconcile. These are the spots a human should
  check.
- The **version** you synced to, and the commit range you diffed (if any).

Do not commit or push unless the user asks. Leave the changes in the target repo's
working tree for review.

## Reference files

- `references/sourcing-map.md` — which website paths feed which skill sections; what
  to skip and why.
- `references/interpreting-mdx.md` — how to read each MDX construct and re-express
  its meaning in the skill (distill, don't transcribe).
- `references/merge-strategy.md` — how to reconcile without regenerating; what to
  preserve, overwrite, and flag.
