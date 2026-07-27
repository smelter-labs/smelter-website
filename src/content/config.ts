import { defineCollection, z } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";

export const BLOG_CATEGORIES = [
  "Live Streaming",
  "Broadcasting",
  "Conferencing",
  "Community",
] as const;

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.enum(BLOG_CATEGORIES),
    author: z.string(),
    /** Cover shown on cards and at the top of the post. Path under /public or an absolute URL. */
    cover: z.string(),
    /** Optional video URL. When set, cards show a play button and a "Watch" affordance. */
    video: z.string().url().optional(),
    /** Human-readable length of the video, e.g. "2:14". Only meaningful with `video`. */
    duration: z.string().optional(),
    /** Marks the single hero entry rendered at the top of the blog index. */
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
  blog,
};
