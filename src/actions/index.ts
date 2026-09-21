import { defineAction } from "astro:actions";
import { getSecret } from "astro:env/server";
import { z } from "astro:schema";
import sendGrid, { type ResponseError } from "@sendgrid/mail";
import {
  CONTACT_ERRORS,
  EMAIL_REGEX,
  MESSAGE_MIN_LENGTH,
  RECAPTCHA_ACTION,
  RECAPTCHA_ERRORS,
  type RecaptchaError,
} from "../utils/contactForm";

const RECAPTCHA_MIN_SCORE = 0.5;

interface SubmitContactResult {
  success: boolean;
  error?: string;
  devWarnings?: string[];
}

async function verifyRecaptcha(
  token: string | undefined,
  devWarnings: string[]
): Promise<RecaptchaError | null> {
  const env = {
    RECAPTCHA_SECRET_KEY: getSecret("RECAPTCHA_SECRET_KEY"),
    GCLOUD_PROJECT_ID: getSecret("GCLOUD_PROJECT_ID"),
    PUBLIC_RECAPTCHA_SITE_KEY: getSecret("PUBLIC_RECAPTCHA_SITE_KEY"),
  };
  const missingEnv = Object.entries(env)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingEnv.length > 0) {
    const details = `${missingEnv.join(", ")} not set`;
    console.error(`${RECAPTCHA_ERRORS.notConfigured}: ${details}.`);
    devWarnings.push(details);
    return RECAPTCHA_ERRORS.notConfigured;
  }
  if (!token) {
    console.error(`${RECAPTCHA_ERRORS.tokenMissing}.`);
    return RECAPTCHA_ERRORS.tokenMissing;
  }

  const res = await fetch(
    `https://recaptchaenterprise.googleapis.com/v1/projects/${env.GCLOUD_PROJECT_ID}/assessments?key=${env.RECAPTCHA_SECRET_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: {
          token,
          siteKey: env.PUBLIC_RECAPTCHA_SITE_KEY,
          expectedAction: RECAPTCHA_ACTION,
        },
      }),
    }
  );
  const assessment = await res.json();

  if (!res.ok) {
    const details = `HTTP ${res.status}: ${JSON.stringify(assessment?.error ?? assessment)}`;
    console.error(`${RECAPTCHA_ERRORS.assessmentFailed} (${details})`);
    devWarnings.push(details);
    return RECAPTCHA_ERRORS.assessmentFailed;
  }

  const { tokenProperties, riskAnalysis } = assessment;
  if (
    !tokenProperties?.valid ||
    tokenProperties.action !== RECAPTCHA_ACTION ||
    (riskAnalysis?.score ?? 0) < RECAPTCHA_MIN_SCORE
  ) {
    const details = JSON.stringify({ tokenProperties, riskAnalysis });
    console.error(`${RECAPTCHA_ERRORS.notValidated}: ${details}`);
    devWarnings.push(details);
    return RECAPTCHA_ERRORS.notValidated;
  }
  return null;
}

async function submitContact(
  {
    email,
    inquiry,
    message,
    recaptchaToken,
  }: {
    email: string;
    inquiry: string;
    message: string;
    recaptchaToken?: string;
  },
  devWarnings: string[]
): Promise<SubmitContactResult> {
  const recaptchaError = await verifyRecaptcha(recaptchaToken, devWarnings);
  if (recaptchaError) return { success: false, error: recaptchaError };

  const SENDGRID_API_KEY = getSecret("SENDGRID_API_KEY");

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

    if (import.meta.env.DEV && !SENDGRID_API_KEY) {
      console.log("[dev] SENDGRID_API_KEY not set - e-mail NOT sent:", msg);
      devWarnings.push("SENDGRID_API_KEY not set - e-mail was not sent.");
      return { success: false, error: "SendGrid API key not set" };
    }

    sendGrid.setApiKey(SENDGRID_API_KEY ?? "");
    await sendGrid.send(msg);
  } catch (error) {
    console.error(error);
    const { code, response } = error as Partial<ResponseError>;
    devWarnings.push(
      response
        ? `SendGrid rejected the e-mail (HTTP ${code}): ${JSON.stringify(response.body)}`
        : `SendGrid send failed: ${error}`
    );
    return { success: false, error: "Failed to send email" };
  }
  return { success: true };
}

export const server = {
  submitContact: defineAction({
    accept: "form",
    input: z.object({
      email: z
        .string({ invalid_type_error: CONTACT_ERRORS.emailRequired })
        .trim()
        .regex(EMAIL_REGEX, CONTACT_ERRORS.emailInvalid),
      inquiry: z.string(),
      message: z
        .string({ invalid_type_error: CONTACT_ERRORS.messageRequired })
        .trim()
        .min(MESSAGE_MIN_LENGTH, CONTACT_ERRORS.messageTooShort),
      privacyConsent: z.literal("on", {
        errorMap: () => ({ message: CONTACT_ERRORS.consentRequired }),
      }),
      recaptchaToken: z.string().optional(),
    }),
    handler: async (input): Promise<SubmitContactResult> => {
      const devWarnings: string[] = [];
      const result = await submitContact(input, devWarnings);
      return import.meta.env.DEV && devWarnings.length > 0 ? { ...result, devWarnings } : result;
    },
  }),
};
