import { defineAction } from "astro:actions";
import { getSecret } from "astro:env/server";
import { z } from "astro:schema";
import sendGrid from "@sendgrid/mail";

export const server = {
  submitContact: defineAction({
    accept: "form",
    input: z.object({
      email: z.string().email(),
      inquiry: z.string(),
      message: z.string(),
    }),
    handler: async ({ email, inquiry, message }) => {
      sendGrid.setApiKey(getSecret('SENDGRID_API_KEY') ?? '');

      try {
        const processedInquiry = inquiry.replace('-', ' ')
        processedInquiry[0].toUpperCase()

        const msg = {
          to: "contact@smelter.dev",
          from: "contact@smelter.dev",
          replyTo: { email: email },
          subject: `${processedInquiry} from ${email.split('@')[0]}`,
          text: `${email}\n\n${message}`,
        };

        await sendGrid.send(msg)
      } catch (error) {
        console.error(error);
      }
      return { success: true };
    },
  }),
};
