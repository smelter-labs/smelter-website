import { defineAction } from "astro:actions";
import { getSecret } from "astro:env/server";
import { z } from "astro:schema";
import { likeCountKey, visitorLikeKey } from "@components/blog/blogHelpers";
import sendGrid from "@sendgrid/mail";
import { blogLikesStore, visitorFingerprint } from "@utils/blogLikesStore";
import { verifyRecaptcha } from "@utils/verifyRecaptcha";

/** A visitor's like is remembered for a year, then they may like the post again. */
const LIKE_TTL_SECONDS = 365 * 24 * 60 * 60;

const slugInput = z.object({ slug: z.string().min(1).max(200) });

export const server = {
  submitContact: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      inquiry: z.string(),
      message: z.string(),
      recaptchaToken: z.string().optional(),
    }),
    handler: async ({ email, inquiry, message, recaptchaToken }) => {
      if (!(await verifyRecaptcha(recaptchaToken, "submit"))) {
        return { success: false, error: "Failed reCAPTCHA verification" };
      }

      sendGrid.setApiKey(getSecret("SENDGRID_API_KEY") ?? "");

      try {
        const processedInquiry = inquiry.replace("-", " ");
        const capitalized = processedInquiry[0].toUpperCase() + processedInquiry.slice(1);
        const subject = `${capitalized} from ${email.split("@")[0]}`;

        const msg = {
          to: "contact@smelter.dev",
          from: "contact@smelter.dev",
          replyTo: { email },
          subject,
          text: `${email}\n\n${message}`,
        };

        await sendGrid.send(msg);
      } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to send email" };
      }
      return { success: true };
    },
  }),

  getBlogLikeCount: defineAction({
    input: slugInput,
    handler: async ({ slug }) => {
      const kv = blogLikesStore();
      if (!kv) return { count: 0, enabled: false };

      const count = await kv.get<number>(likeCountKey(slug));
      return { count: count ?? 0, enabled: true };
    },
  }),

  likeBlogPost: defineAction({
    input: slugInput.extend({ recaptchaToken: z.string().optional() }),
    handler: async ({ slug, recaptchaToken }, context) => {
      const kv = blogLikesStore();
      if (!kv) return { count: 0, enabled: false, liked: false };

      if (!(await verifyRecaptcha(recaptchaToken, "blog_like"))) {
        const count = (await kv.get<number>(likeCountKey(slug))) ?? 0;
        return { count, enabled: true, liked: false };
      }

      const fingerprint = await visitorFingerprint(context.request);
      const likedKey = visitorLikeKey(slug, fingerprint);

      // NX makes claim-the-slot atomic: only the first request for this
      // visitor+post gets to increment, so double clicks cannot double count.
      const claimed = await kv.set(likedKey, 1, { ex: LIKE_TTL_SECONDS, nx: true });
      if (!claimed) {
        const count = (await kv.get<number>(likeCountKey(slug))) ?? 0;
        return { count, enabled: true, liked: true };
      }

      const count = await kv.incr(likeCountKey(slug));
      return { count, enabled: true, liked: true };
    },
  }),
};
