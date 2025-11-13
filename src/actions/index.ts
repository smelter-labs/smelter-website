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
      recaptchaToken: z.string().optional(),
    }),
    handler: async ({ email, inquiry, message, recaptchaToken }) => {
      const RECAPTCHA_SECRET_KEY = getSecret("RECAPTCHA_SECRET_KEY");
      const PROJECT_ID = getSecret("GCLOUD_PROJECT_ID");
      const SITE_KEY = getSecret("PUBLIC_RECAPTCHA_SITE_KEY");

      const verifyRes = await fetch(
        `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${RECAPTCHA_SECRET_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: {
              token: recaptchaToken,
              siteKey: SITE_KEY,
              expectedAction: "submit",
            },
          }),
        }
      );
      const verifyData = await verifyRes.json();

      if (!verifyData?.tokenProperties?.valid || verifyData?.riskAnalysis?.score < 0.5) {
        return { success: false, error: "Failed reCAPTCHA verification" };
      }

      sendGrid.setApiKey(getSecret("SENDGRID_API_KEY") ?? "");

      try {
        const processedInquiry = inquiry.replace("-", " ");
        const subject = `${processedInquiry[0].toUpperCase() + processedInquiry.slice(1)} from ${email.split("@")[0]}`;

        const msg = {
          to: "contact@smelter.dev",
          from: "contact@smelter.dev",
          replyTo: { email },
          subject,
          text: `${email}\n\n${message}`,
        };

        // await sendGrid.send(msg);
      } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to send email" };
      }
      return { success: true };
    },
  }),
};
