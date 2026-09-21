import { useEffect } from "react";

export interface CaptchaProps {
  siteKey: string;
}

export function Captcha({ siteKey }: CaptchaProps) {
  useEffect(() => {
    if (document.getElementById("grecaptcha-script") !== null) return;

    const script = document.createElement("script");
    script.id = "grecaptcha-script";
    script.async = true;
    script.defer = true;
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
    document.body.appendChild(script);
  }, [siteKey]);

  return null;
}
