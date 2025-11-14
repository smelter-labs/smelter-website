import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface CaptchaProps {
  siteKey: string;
}

export interface CaptchaRef {
  reset: () => void;
  getValue: () => string;
  execute: (action: string) => Promise<string>;
}

export const Captcha = forwardRef<CaptchaRef, CaptchaProps>(function (
    { siteKey },
    ref
  ) {
    const tokenRef = useRef("");
    const isReadyRef = useRef(false);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        tokenRef.current = "";
      },
      getValue: () => {
        return tokenRef.current;
      },
      execute: async (_action: string) => {
        if (!window.grecaptcha || !isReadyRef.current) {
          console.warn("[Captcha] reCAPTCHA v3 not ready");
          return "";
        }

        try {
          const token = await window.grecaptcha.execute(siteKey, {
            action: _action,
          });
          tokenRef.current = token;
          return token;
        } catch (error) {
          console.error("[Captcha] Execution failed", error);
          return "";
        }
      },
    }),
    [siteKey],
  );

  useEffect(() => {
    if (document.getElementById("grecaptcha-script") === null) {
      const script = document.createElement("script");
      script.id = "grecaptcha-script";
      script.async = true;
      script.defer = true;
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;

      script.onload = () => {
        window.grecaptcha?.ready(() => {
          isReadyRef.current = true;
        });
      };

      document.body.appendChild(script);
    } else {
      window.grecaptcha?.ready(() => {
        isReadyRef.current = true;
      });
    }

    return () => {
      tokenRef.current = "";
      isReadyRef.current = false;
    };
  }, [siteKey]);

  return null;
});

Captcha.displayName = "Captcha";
