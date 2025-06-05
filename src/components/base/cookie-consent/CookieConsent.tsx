import { useEffect, useState } from "react";
import clarity from "react-microsoft-clarity";
import styles from "./cookie-consent.module.css";

export default function CookieConsent({ variant = "page" }: { variant?: "page" | "docs" }) {
  const [mode, setMode] = useState<"consent" | "details" | "hidden">("hidden");
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
  });

  useEffect(() => {
    clarity.clarity.init("rr6q6gt4xx");
    const cookiePreferences = localStorage.getItem("cookiePreferences")
    const savedPreferences =  cookiePreferences ? JSON.parse(cookiePreferences) : false ;
    if (savedPreferences) {
      setPreferences(savedPreferences);
      setMode("hidden");
    } else {
      setMode("consent");
    }
  }, []);

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      analytics: true,
    });
    clarity.clarity.consent(true);
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify({
        essential: true,
        analytics: true,
      })
    );
    setMode("hidden");
  };

  const handleRejectAll = () => {
    setPreferences({
      essential: true,
      analytics: false,
    });
    clarity.clarity.consent(false);
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify({
        essential: true,
        analytics: false,
      })
    );
    setMode("hidden");
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    setMode("hidden");
  };

  return (
    <div id="cookie-consent" className={mode === "hidden" ? styles.hidden : styles.block}>
      <div
        id="cookie-banner"
        className={`${styles.cookieBanner} ${variant === "docs" ? styles.docsTheme : ""} ${mode === "consent" ? styles.block : styles.hidden}`}>
        <div className={styles.bannerTextWrapper}>
          <div className={styles.cookieText}>
            <h3>We use cookies</h3>
            <p>
              We use cookies to persist your settings and analyze our traffic. Please select your
              preferences.
            </p>
          </div>

          <div className={styles.bannerButtons}>
            <div className={styles.bannerButtonsTop}>
              <button
                type="button"
                onClick={handleRejectAll}
                id="reject-all"
                className={`${styles.button} ${styles.buttonPrimary}`}>
                Deny non-essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                id="accept-all"
                className={`${styles.button} ${styles.buttonPrimary}`}>
                Accept all
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode("details");
              }}
              id="manage-preferences"
              className={`${styles.button} ${styles.buttonSecondary}`}>
              Manage Individual preferences
            </button>
          </div>
        </div>
      </div>

      <div
        id="cookie-preferences"
        className={`${styles.cookiePreferences} ${variant === "docs" ? styles.docsTheme : ""} ${mode === "details" ? styles.block : styles.hidden}`}>
        <div className={styles.preferencesHeader}>
          <h3>Cookie Preferences</h3>
          <button
            type="button"
            onClick={() => setMode("consent")}
            id="close-preferences"
            className={styles.closeButton}>
            ×
          </button>
        </div>

        <div className={`${styles.preferencesContent}`}>
          <div className={`${styles.cookieCategory}`}>
            <label className={`${styles.cookieLabel}`}>
              <div className={`${styles.cookieInfo}`}>
                <h4>Essential Cookies</h4>
                <p>Required for basic site functionality. These cannot be disabled.</p>
              </div>
              <div className={`${styles.toggleWrapper}`}>
                <input type="checkbox" id="essential-cookies" checked disabled />
                <span className={`${styles.toggle} ${styles.essential}`} />
              </div>
            </label>
          </div>

          <div className={`${styles.cookieCategory}`}>
            <label className={`${styles.cookieLabel}`}>
              <div className={`${styles.cookieInfo}`}>
                <h4>Analytics Cookies</h4>
                <p>Help us understand how visitors interact with our website.</p>
              </div>
              <div className={`${styles.toggleWrapper}`}>
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setPreferences((prevPreferences) => ({
                      ...prevPreferences,
                      analytics: e.target.checked,
                    }));
                  }}
                  id="analytics-cookies"
                />
                <span className={`${styles.toggle}`} />
              </div>
            </label>
          </div>
        </div>

        <div className={styles.preferencesActions}>
          <button
            type="button"
            onClick={handleSavePreferences}
            id="save-preferences"
            className={`${styles.button} ${styles.buttonPrimary}`}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
