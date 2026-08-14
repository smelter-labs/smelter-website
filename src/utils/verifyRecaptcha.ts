import { getSecret } from "astro:env/server";

/** Below this reCAPTCHA Enterprise risk score the request is treated as a bot. */
const MIN_SCORE = 0.5;

/**
 * Verifies a reCAPTCHA Enterprise v3 token for a given action.
 *
 * Returns `false` for invalid or low-score tokens, and also when the keys are
 * missing from env — fail closed, as the contact action did before this was
 * extracted out of it.
 */
export async function verifyRecaptcha(
  token: string | undefined,
  expectedAction: string
): Promise<boolean> {
  const secretKey = getSecret("RECAPTCHA_SECRET_KEY");
  const projectId = getSecret("GCLOUD_PROJECT_ID");
  const siteKey = getSecret("PUBLIC_RECAPTCHA_SITE_KEY");

  try {
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${secretKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: { token, siteKey, expectedAction },
        }),
      }
    );
    const data = await response.json();

    return Boolean(data?.tokenProperties?.valid) && !(data?.riskAnalysis?.score < MIN_SCORE);
  } catch (error) {
    console.error("[recaptcha] verification request failed", error);
    return false;
  }
}
