export const EMAIL_REGEX = /^[^\s@]+@(?:[a-z0-9-]+\.)+[a-z]{2,}$/i;
export const MESSAGE_MIN_LENGTH = 10;
export const CONTACT_EMAIL = "contact@smelter.dev";

export const CONTACT_ERRORS = {
  emailRequired: "Please enter your e-mail address.",
  emailInvalid: "Please enter a valid e-mail address.",
  messageRequired: "Please tell us about your needs.",
  messageTooShort: `Your message must be at least ${MESSAGE_MIN_LENGTH} characters long.`,
  consentRequired: "Please accept the Privacy Policy to continue.",
  submitFailed: `We couldn't send your message. Please try again or e-mail us directly at ${CONTACT_EMAIL}.`,
  serverError: `Something went wrong on our side. Please try again later or e-mail us directly at ${CONTACT_EMAIL}.`,
} as const;

export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return CONTACT_ERRORS.emailRequired;
  if (!EMAIL_REGEX.test(email)) return CONTACT_ERRORS.emailInvalid;
  return null;
}

export function validateMessage(value: string): string | null {
  const length = value.trim().length;
  if (length === 0) return CONTACT_ERRORS.messageRequired;
  if (length < MESSAGE_MIN_LENGTH) return CONTACT_ERRORS.messageTooShort;
  return null;
}

export function validateConsent(checked: boolean): string | null {
  return checked ? null : CONTACT_ERRORS.consentRequired;
}
