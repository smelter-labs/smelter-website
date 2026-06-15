# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Astro + Starlight site for [Smelter](https://smelter.dev), deployed to Vercel as **SSR** (`prerender: false`). Most of what you need is in `package.json`, `astro.config.mjs`, and `biome.json` — this file only calls out things that aren't obvious from those.

## Branches

- **`main`** — docs for **released** Smelter versions. PRs targeting released-version content go here.
- **`next`** — docs for the **unreleased** Smelter version. The "current"/unversioned docs evolve here ahead of a release.
- On `next`, the snapshotted versioned content under `src/content/docs/versions/**` and `src/content/versions/**` is **frozen — never modify it**. Versioned snapshots only get updated on `main` (i.e. for already-released versions). If you need to edit unreleased docs, edit the unversioned `src/content/docs/{ts-sdk,http-api}/...` files on `next`, not the version snapshots.

## Build / CI gates

CI (`.github/workflows/ci.yml`) runs **two** checks: `biome ci .` and `pnpm astrocheck` (= `astro check --minimumFailingSeverity warning`). `pnpm build` runs the stricter `astro check` + build. Run both `pnpm check` and `pnpm astrocheck` locally before pushing.

`starlight-links-validator` is gated behind `ENABLE_LINK_CHECKER=1` (off by default for fast iteration); enable it before shipping anything that reshuffles routes.

## Versioned docs (the tricky part)

**Only do versioning work against `main`.** The version snapshots (`src/content/docs/versions/**`, `src/content/versions/**`) and the `starlightVersions({ versions: [...] })` config exist for already-released versions; on `next` they are frozen and must not be touched. Cutting a new version, editing snapshot content, or adding/removing entries from the version list all happen on `main`.

Versioning is the part of this repo most likely to bite. It uses a **local fork** of `starlight-versions` at `packages/starlight-versions-custom/` (referenced via `"file:..."` in `package.json` — don't `pnpm add` upstream). Adding/maintaining a version requires three coordinated changes (on `main`):

1. Snapshot the docs into `src/content/docs/versions/{ts-sdk,http-api}/<version>/...`.
2. Add the matching sidebar JSON at `src/content/versions/{ts-sdk,http-api}/<version>.json` — its shape mirrors the live `sidebar:` block in `astro.config.mjs`.
3. Register the version in `starlightVersions({ versions: [...] })` in `astro.config.mjs`.

The "current" sidebar is **hard-coded** in `astro.config.mjs`. New doc pages outside an `autogenerate` directory must be added there too, plus to each versioned sidebar JSON if backported.

`src/middleware.ts` manages the `selectedVersion` cookie based on URL (handles `?bannerRedirect`, versionless paths under versioned sections, etc.). Touch with care.

## Markdown / MDX docs

All docs live as `.mdx` (occasionally `.md`) under `src/content/docs/`, organized into four top-level sections that the `sidebar:` block in `astro.config.mjs` mirrors:

- **`fundamentals/`** — cross-cutting concepts (`getting-started`, `setup-choices`, `glossary`, `how-it-works`, plus `concepts/`).
- **`deployment/`** — server deployment (`setup`, `configuration`, `benchmarks`, `variants/`).
- **`ts-sdk/`** — TypeScript SDK reference. Subdirectories follow a fixed shape: `components/`, `components/props/`, `hooks/`, `inputs/`, `outputs/`, `outputs/encoders/`, `resources/`, `guides/`, plus runtime-specific pages under `nodejs/`, `web-client/`, `web-wasm/` and entry pages `overview.mdx`, `configuration.mdx`, `smelter.mdx`, `smelter-offline.mdx`.
- **`http-api/`** — same idea for the HTTP server (`overview`, `routes`, `events`, `components/`, `inputs/`, `outputs/`, `outputs/encoders/`, `resources/`, `guides/`).

Conventions used inside doc pages:

- Frontmatter is just `title:` (Starlight derives the rest from filename and sidebar config). Page slug = path relative to `src/content/docs/`, lowercased.
- Reference pages (components, inputs, outputs, hooks) follow a recurring layout: optional `Badge` row for runtime availability → short intro → `## Usage` (code snippet) → `## Reference` with a `<CollapsibleDetails summaryTitle='Type definitions' open>` block containing the TS type → `## Props` / `## Properties` listing fields with `**Type**`, `**Default value**`, optional `**Option availability**` badges, separated by `---`.
- Per-runtime availability is signaled with `<Badge text="Node.js" />`, `<Badge text="Browser (Client)" />`, `<Badge text="Browser (WASM)" />`. Keep wording identical — these are scanned visually across pages.
- Code examples: prefer **fenced ``` ``` blocks** (with `title=...` if needed) for inline snippets. Only use the `<Code code={...} ... />` component when the snippet is **imported from a separate `.tsx` file** via Vite's `?raw` suffix — e.g. real, type-checked examples kept under `<section>/examples/` and imported as `import imageExample from './examples/Image.tsx?raw'` then rendered with `<Code code={imageExample} title='ImageExample.tsx' lang='tsx' collapse={["12-33"]} />`. Standalone example files get Biome's `lineWidth: 75` override so they fit in the rendered block.
- Common imports at the top of an MDX file: `Aside`, `Badge`, `Code`, `Tabs`, `TabItem` from `@astrojs/starlight/components`; `CollapsibleDetails` from `@components/CollapsibleDetails.astro`; assets from `@assets/...`. Use the `@components` / `@assets` aliases (defined in `tsconfig.json`), not relative paths up the tree.
- `<Aside>` (default / `type='caution'` / `type='tip'`) is the standard way to call out constraints like "exactly one of X or Y must be defined".
- Anything under an `autogenerate: { directory: ... }` sidebar entry is picked up by filename — just dropping a new `.mdx` in works. Anything outside such a directory needs an explicit entry in the sidebar (see Versioned docs section above).
- Internal links are slugged paths starting with `/`, e.g. `/ts-sdk/components/view`. The links validator (`ENABLE_LINK_CHECKER=1`) catches typos.

## Other non-obvious wiring

- **Starlight is patched** via pnpm `patchedDependencies` (`patches/@astrojs__starlight@0.32.0.patch`). Upgrading Starlight requires re-applying or refreshing this patch.
- **WASM demos**: the Vite config copies `smelter.wasm` from `@swmansion/smelter-browser-render` into the build, and `optimizeDeps.exclude` includes `@swmansion/smelter-web-wasm`. Don't "simplify" these — the demos break without them.
- **Tailwind has `applyBaseStyles: false`**. Base styles come from `styles/*.scss` listed in Starlight's `customCss`. Don't enable preflight.
- **Biome `lineWidth` is 75 (not 100)** for `src/content/docs/ts-sdk/**/examples/**/*.tsx` and the equivalent path under `versions/`, so embedded MDX snippets fit. Editing example files? Format with the override applied.
- `src/components/starlight-overrides/PageFrame.astro` overrides Starlight's default via the `components:` config; further overrides live inside the local versions package.
