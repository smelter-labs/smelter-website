/** Canonical origin — used for absolute URLs in share links, RSS and OG tags. */
export const BLOG_SITE_ORIGIN = "https://smelter.dev";

/** Repo + branch the blog sources live in, for the "View on GitHub" link. */
export const BLOG_GITHUB_REPO = "smelter-labs/smelter-website";
export const BLOG_GITHUB_BRANCH = "main";

/** Design shows dates like "18 JUN 2026". */
export function formatBlogDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
  return `${day} ${month} ${date.getUTCFullYear()}`;
}

/** Absolute URL of a post, e.g. https://smelter.dev/blog/my-post. */
export function postUrl(slug: string): string {
  return `${BLOG_SITE_ORIGIN}/blog/${slug}`;
}

/**
 * Link to the post's source file on GitHub. Entry ids match the file name
 * under src/content/blog/, so `.mdx` is the right extension for every post.
 */
export function githubSourceUrl(slug: string): string {
  return `https://github.com/${BLOG_GITHUB_REPO}/blob/${BLOG_GITHUB_BRANCH}/src/content/blog/${slug}.mdx`;
}

const RASTER_IMAGE = /\.(png|jpe?g|webp|gif)(\?.*)?$/i;

/**
 * Absolute `og:image` for a post, or `undefined` to keep the site-wide default.
 *
 * Social crawlers (X, LinkedIn, Facebook, Slack) don't render SVG, so an SVG
 * cover would produce an *empty* preview card — worse than the generic one.
 * Give a post a raster cover and its own image is used automatically.
 */
export function postOgImage(cover: string): string | undefined {
  if (!RASTER_IMAGE.test(cover)) return undefined;
  return cover.startsWith("http") ? cover : `${BLOG_SITE_ORIGIN}${cover}`;
}

export interface ShareLink {
  label: string;
  href: string;
}

/** Share intent URLs for the networks shown in the share bar. */
export function buildShareLinks(title: string, url: string): ShareLink[] {
  const t = encodeURIComponent(title);
  const u = encodeURIComponent(url);
  return [
    { label: "X", href: `https://x.com/intent/tweet?text=${t}&url=${u}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "Hacker News", href: `https://news.ycombinator.com/submitlink?u=${u}&t=${t}` },
    { label: "Reddit", href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
  ];
}

/** KV key holding the like count of a post. */
export function likeCountKey(slug: string): string {
  return `blog:likes:${slug}`;
}

/** KV key marking that a given visitor already liked a post (dedup). */
export function visitorLikeKey(slug: string, fingerprint: string): string {
  return `blog:liked:${slug}:${fingerprint}`;
}

/** localStorage key mirroring `visitorLikeKey` on the client, for optimistic UI. */
export function localLikeKey(slug: string): string {
  return `blog-liked-${slug}`;
}
