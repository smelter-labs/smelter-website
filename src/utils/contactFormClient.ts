import { actions, isInputError } from "astro:actions";
import {
  CONTACT_EMAIL,
  CONTACT_ERRORS,
  validateConsent,
  validateEmail,
  validateMessage,
} from "./contactForm";

const publicRecaptchaKey = import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY;
const RECAPTCHA_TIMEOUT_MS = 10_000;

function getRecaptchaToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof grecaptcha === "undefined") {
      reject(new Error("reCAPTCHA is not loaded"));
      return;
    }
    const timeout = setTimeout(
      () => reject(new Error("reCAPTCHA timed out")),
      RECAPTCHA_TIMEOUT_MS,
    );
    grecaptcha.enterprise.ready(async () => {
      try {
        resolve(
          await grecaptcha.enterprise.execute(publicRecaptchaKey, {
            action: "submit",
          }),
        );
      } catch (error) {
        reject(error);
      } finally {
        clearTimeout(timeout);
      }
    });
  });
}

type Field = "email" | "message" | "privacyConsent";
type FieldElement = HTMLInputElement | HTMLTextAreaElement;

const validators: Record<Field, (el: FieldElement) => string | null> = {
  email: (el) => validateEmail(el.value),
  message: (el) => validateMessage(el.value),
  privacyConsent: (el) => validateConsent((el as HTMLInputElement).checked),
};
const FIELDS = Object.keys(validators) as Field[];

function closeSnackbar() {
  const snackbar = document.getElementById("successSnackbar");
  snackbar?.classList.remove("translate-y-0", "opacity-100");
  snackbar?.classList.add("translate-y-full", "opacity-0");
}

function showSnackbar() {
  const snackbar = document.getElementById("successSnackbar");
  snackbar?.classList.remove("translate-y-full", "opacity-0");
  snackbar?.classList.add("translate-y-0", "opacity-100");
  setTimeout(closeSnackbar, 5000);
}

export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>("#contact form");
  if (!form || form.dataset.contactBound === "1") return;
  form.dataset.contactBound = "1";

  // Set from JS so that without it the browser's native `required` checks still apply.
  form.noValidate = true;

  const liveFields = new Set<Field>();

  const fieldElement = (field: Field) =>
    form.elements.namedItem(field) as FieldElement;

  function setError(field: Field, error: string | null) {
    const errorElement = document.getElementById(`contact-${field}-error`);
    if (errorElement) errorElement.textContent = error ?? "";
    if (error) {
      fieldElement(field).setAttribute("aria-invalid", "true");
      liveFields.add(field);
    } else {
      fieldElement(field).removeAttribute("aria-invalid");
    }
  }

  function validate(field: Field): boolean {
    const error = validators[field](fieldElement(field));
    setError(field, error);
    return !error;
  }

  for (const field of FIELDS) {
    const element = fieldElement(field);
    element.addEventListener("blur", () => {
      if (element.value.trim()) validate(field);
    });
    element.addEventListener(
      field === "privacyConsent" ? "change" : "input",
      () => {
        if (liveFields.has(field)) validate(field);
      },
    );
  }

  form.addEventListener("reset", () => {
    for (const field of FIELDS) setError(field, null);
    liveFields.clear();
  });

  const submitButton = form.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );
  const submitLabel = submitButton?.querySelector("p");
  const idleLabel = submitLabel?.textContent ?? "";
  let submitting = false;

  function setSubmitting(value: boolean) {
    submitting = value;
    if (submitButton) {
      submitButton.disabled = value;
      submitButton.setAttribute("aria-busy", String(value));
    }
    if (submitLabel) submitLabel.textContent = value ? "Sending…" : idleLabel;
  }

  function setFormError(error: string | null) {
    const errorElement = document.getElementById("contact-form-error");
    if (!errorElement) return;
    errorElement.replaceChildren();
    if (!error) return;

    // Render the contact address in the message as a mailto link.
    const [before, ...after] = error.split(CONTACT_EMAIL);
    errorElement.append(before);
    if (after.length > 0) {
      const link = document.createElement("a");
      link.href = `mailto:${CONTACT_EMAIL}`;
      link.textContent = CONTACT_EMAIL;
      link.className = "text-form-error underline underline-offset-2";
      errorElement.append(link, after.join(CONTACT_EMAIL));
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);

    const invalidFields = FIELDS.filter((field) => !validate(field));
    if (invalidFields.length > 0) {
      const firstInvalid = fieldElement(invalidFields[0]);
      firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
      firstInvalid.focus({ preventScroll: true });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData(form);

      if (!import.meta.env.DEV) {
        formData.append("recaptchaToken", await getRecaptchaToken());
      }

      const { data, error } = await actions.submitContact(formData);
      if (isInputError(error)) {
        for (const field of FIELDS)
          setError(field, error.fields[field]?.[0] ?? null);
        if (!FIELDS.some((field) => error.fields[field])) {
          console.error("[ContactForm] Rejected input:", error.fields);
          setFormError(CONTACT_ERRORS.submitFailed);
        }
        return;
      }
      if (error || !data.success) {
        console.error(
          "[ContactForm] Server failed to send the message:",
          error ?? data.error,
        );
        setFormError(CONTACT_ERRORS.serverError);
        return;
      }
      form.reset();
      showSnackbar();
    } catch (error) {
      console.error("[ContactForm] Failed to send the message:", error);
      setFormError(CONTACT_ERRORS.submitFailed);
    } finally {
      setSubmitting(false);
    }
  });
}
