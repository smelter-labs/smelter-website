import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import { BLOG_SITE_ORIGIN } from "@components/blog/blogHelpers";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: "Smelter Blog",
    description:
      "The latest videos and demos from creators building real-time video and audio pipelines on Smelter.",
    site: context.site ?? BLOG_SITE_ORIGIN,
    stylesheet: false,
    // The site is `trailingSlash: "never"` — without this every feed link would
    // point at a URL that 308-redirects.
    trailingSlash: false,
    customData: "<language>en</language>",
    items: posts.map((entry) => ({
      link: `/blog/${entry.id}`,
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      categories: [entry.data.category],
    })),
  });
}
