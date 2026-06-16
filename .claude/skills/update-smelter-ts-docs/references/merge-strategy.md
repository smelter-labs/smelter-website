# Merge strategy — reconcile, don't regenerate

The single most important rule of this skill: **the existing `smelter-ts-docs` content
is not scratch paper.** Someone shaped it into a good reference — they trimmed,
reorganized, added explanations and examples the website doesn't have. If you
regenerate from the website you destroy that work and the skill regresses to a
transcription. So you reconcile: correct the API, keep the craft.

## The mental model: two layers

Think of every skill section as two overlapping layers:

1. **API surface** — the facts that must match the SDK: type definitions, prop and
   argument names, defaults, return types, valid enum values, and runtime
   availability. The website is authoritative here. **On any mismatch, the website
   wins and you rewrite.** This layer must also be **complete**: every component,
   hook, input, output, encoder, and resource, and every prop/property/argument
   within them, has to be documented. If the website documents an option the skill
   omits, add it — a missing API field is a bug, not a stylistic choice. The
   editorial freedom below applies to *how* things are explained, never to *whether*
   an API option is present.

2. **Editorial layer** — everything a human added on top: how the section is
   organized, prose explanations, extra or rewritten examples, cross-cutting patterns,
   "gotcha" notes. This is the value of the skill over the raw docs. **Preserve it
   unless it contradicts the API.**

Most edits are surgical: a default changed, a prop was added, an availability badge
moved. Change exactly that, and leave the surrounding writing alone.

## Decision rules

For each piece of existing skill content, decide:

- **Matches the website API** → leave it. Don't reword for the sake of it.
- **Contradicts the website API** → rewrite to match the website. This is the only
  case where you overwrite human-written text outright.
- **Doesn't contradict, but plausibly stale** → this is the subtle one. If a
  hand-written passage describes behavior tied to something that *just changed*
  (e.g. it explains how a prop behaves and that prop's type or default just moved),
  there's a real chance it's now wrong even though it doesn't literally conflict.
  **Don't silently keep it and don't silently rewrite it — flag it** for the user,
  with the specific reason you're suspicious.
- **Website-only, new** → add it (a new prop, a new input type, a new component),
  re-expressing the source per `interpreting-mdx.md`. When the new item gets its own
  reference file (a component, hook, input, output, resource), also add its one-line
  entry to the SKILL.md index (see *Keep SKILL.md a complete map* below) and remove the
  entry when an item is dropped.
- **Skill-only, not in the website** → usually keep. The skill is allowed to have
  extra guidance the docs lack. Only remove it if the website change makes it wrong
  (then it's a "contradicts" case) — and when in doubt, flag rather than delete.

## Keep SKILL.md a complete map

SKILL.md is the only file always in the agent's context; the per-item reference files
are loaded on demand. For that to work, SKILL.md must let the agent decide *which* file
to open **without opening any** — so it carries a one-line descriptor for every
component, hook, input, output, and resource (what it's for, and runtime availability
where that varies). An agent should never have to read a reference file just to find
out what it is.

So when you add or remove an item, update its one-liner in the SKILL.md index too, and
keep those lines terse — the depth belongs in the reference file, not here. If you find
the index has drifted from the actual reference files (an item present in one but not
the other), reconcile it.

## What "contradicts" actually means

Be precise so you don't over-rewrite:

- A **different default value, type, prop name, or availability** is a contradiction.
  Fix it.
- A **different explanation, ordering, or example** is *not* a contradiction. The
  skill is allowed to explain things its own way. Leave it.
- The website adding a **new** prop doesn't make the skill's existing prose wrong —
  it just means you add the new prop.

## Targeted vs full-pass discipline

- In **targeted** mode (the user named a specific change), resist the urge to "tidy
  up" unrelated sections. You'll introduce churn and risk regressing hand-tuned
  content you weren't asked to touch. Change only what the named feature touches.
- In **release-range** mode, let the website `git diff` define the blast radius —
  sync the sections whose source files changed, plus anything those changes clearly
  ripple into.
- In **full-pass** mode, still apply the two-layer model section by section. "Full
  pass" means *check everything*, not *rewrite everything*.

## The flag list

Flagging is how you stay safe without being destructive. A good flag tells the user
exactly where to look and why:

> `references/inputs/mp4.md` — kept the note "decoder defaults to FFmpeg" but the
> website's `mp4` type definition now shows a `decoder` field with options
> `ffmpeg_h264` | `vulkan_h264`. The note may be incomplete; please confirm the
> default.

Collect these as you go and present them in the final report (SKILL.md Step 4).
Empty is fine — if everything reconciled cleanly, say so.
