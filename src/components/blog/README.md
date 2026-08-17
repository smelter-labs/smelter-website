# Blog social features — setup

Everything here degrades to "off" when its env vars are missing, so the site
builds and runs locally with no configuration. To turn the features on in a
deployment, do the following once.

## 1. GitHub Discussions + Giscus (comments)

1. On `smelter-labs/smelter-website`: **Settings → General → Features → Discussions** → enable.
2. In the repo's **Discussions** tab, create a category named `Blog`
   (format: _Announcements_, so only maintainers can open threads — giscus opens
   them on behalf of the app).
3. Install the [giscus GitHub App](https://github.com/apps/giscus) on the repo.
4. Go to [giscus.app](https://giscus.app), enter the repo, pick the `Blog`
   category, and copy the four values it generates into Vercel env
   (all environments):

   | Variable                     | Example                          |
   | ---------------------------- | -------------------------------- |
   | `PUBLIC_GISCUS_REPO`         | `smelter-labs/smelter-website`   |
   | `PUBLIC_GISCUS_REPO_ID`      | `R_kgDO...`                      |
   | `PUBLIC_GISCUS_CATEGORY`     | `Blog`                           |
   | `PUBLIC_GISCUS_CATEGORY_ID`  | `DIC_kwDO...`                    |

The comments section is only rendered when **all four** are set. These are read
at build time (`astro:env` `context: "server"`, `access: "public"`), so changing
them requires a redeploy.

Discussions are mapped with `data-mapping="specific"` and the term
`/blog/<slug>` — the thread follows the post even if the page is viewed on a
preview domain.

## 2. Vercel KV (likes)

> **Currently unused.** The like button is not rendered anywhere — `LikeButton.tsx`,
> the `getBlogLikeCount` / `likeBlogPost` actions and `blogLikesStore.ts` are kept
> intact so the feature can be switched back on by re-adding `<LikeButton />` to
> `PostCard.astro`, `FeaturedPost.astro` and `pages/blog/[...slug].astro`.

1. Vercel dashboard → **Storage → Create Database → Redis** → connect it to this
   project. Vercel injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   automatically.
2. Redeploy so the functions pick the vars up.

Keys written (see `blogHelpers.ts`):

- `blog:likes:<slug>` — the counter, incremented with `INCR`.
- `blog:liked:<slug>:<fingerprint>` — dedup marker, `SET NX` with a 365 day TTL.
  The fingerprint is a SHA-256 of `x-forwarded-for` + `user-agent`; the raw
  values are never stored.

Without these vars the like button renders, shows `0`, and logs a warning on
click instead of failing.

> `@vercel/kv` is deprecated upstream — the Vercel Marketplace now provisions
> Upstash Redis instead. It injects the same `KV_REST_API_*` variables, so the
> client keeps working; swapping to `@upstash/redis` later is a drop-in change
> confined to `src/utils/blogLikesStore.ts`.

## 3. reCAPTCHA

Likes are verified with the existing reCAPTCHA Enterprise setup
(`RECAPTCHA_SECRET_KEY`, `GCLOUD_PROJECT_ID`, `PUBLIC_RECAPTCHA_SITE_KEY`) under
a new action name, `blog_like`. v3 accepts arbitrary action strings, so nothing
has to be registered in the Google Cloud console. Verification **fails closed**:
if the keys are missing, likes are rejected.

## 4. Local development

Copy the vars from Vercel into `.env` (`vercel env pull`) if you want to exercise
likes or comments locally. Otherwise both stay inert and everything else — share
bar, GitHub source link, RSS — works offline.
