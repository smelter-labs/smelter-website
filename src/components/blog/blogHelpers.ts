/** Canonical origin — used for absolute URLs in share links, RSS and OG tags. */
export const BLOG_SITE_ORIGIN = "https://smelter.dev";

/** Dates render like "18 Jun 2026". */
export function formatBlogDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${day} ${month} ${date.getUTCFullYear()}`;
}

/** Absolute URL of a post, e.g. https://smelter.dev/blog/my-post. */
export function blogPostUrl(slug: string): string {
  return `${BLOG_SITE_ORIGIN}/blog/${slug}`;
}

const YOUTUBE_ID =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;

/**
 * Privacy-preserving embed URL for a YouTube link, or `null` for anything we
 * can't turn into a player (the post then falls back to a plain link out).
 */
export function youtubeEmbedUrl(video: string): string | null {
  const id = YOUTUBE_ID.exec(video)?.[1];
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
}

const RASTER_IMAGE = /\.(png|jpe?g|webp|gif)(\?.*)?$/i;

/**
 * Turns a cover — a path under `/public` or an absolute URL, both allowed by
 * the blog schema — into an absolute `og:image`, or `undefined` to keep the
 * site-wide default.
 *
 * Social crawlers (X, LinkedIn, Facebook, Slack) don't render SVG, so an SVG
 * cover would produce an *empty* preview card — worse than the generic one.
 * Give a post a raster cover and its own image is used automatically.
 */
export function sanitizeOgImage(coverUrl: string): string | undefined {
  if (!RASTER_IMAGE.test(coverUrl)) return undefined;
  return coverUrl.startsWith("http") ? coverUrl : `${BLOG_SITE_ORIGIN}${coverUrl}`;
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
