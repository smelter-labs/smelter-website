import { defineAction } from "astro:actions";
import { getSecret } from "astro:env/server";
import { z } from "astro:schema";
import sendGrid from "@sendgrid/mail";
import { verifyRecaptcha } from "@utils/verifyRecaptcha";

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
};
