import { useEffect, useState } from "react";
import clarity from "react-microsoft-clarity";
import styles from "./cookie-consent.module.css";

export default function CookieConsent({ variant = "page" }: { variant: "page" | "docs" }) {
  const [mode, setMode] = useState<"consent" | "details" | "hidden">("hidden");
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
  });

  useEffect(() => {
    clarity.clarity.init("rr6q6gt4xx");
    // Emulating fetching user's saved cookie preferences from local storage
    const savedPreferences = JSON.parse(localStorage.getItem("cookiePreferences"));
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

  const handleManagePreferences = () => {
    setMode("details");
  };

  return (
    <div
      id="cookie-consent"
      className={`${mode === "hidden" ? "hidden" : "block"} transition-all duration-300 ${variant === "docs" ? "docs-theme" : ""}`}>
      <div
        id="cookie-banner"
        className={`fixed right-8 bottom-8 z-50 max-w-[675px] rounded-2xl border border-solid p-6 ${
          variant === "docs" ? "border-[#bec2cc] bg-[#212635]" : "border-[#493880] bg-[#161127]"
        } ${mode === "consent" ? "block" : "hidden"}`}>
        <div id="banner-text-wrapper" className="flex gap-6">
          <div id="cookie-text" className="flex-1">
            <h3 className="mb-2 text-white text-xl">We use cookies</h3>
            <p className="text-[#ffffffbf] text-sm leading-6">
              We use cookies to persist your settings and analyze our traffic. Please select your
              preferences.
            </p>
          </div>
          <div id="banner-buttons" className="flex flex-1 flex-col gap-3">
            <div id="banner-buttons-top" className="flex flex-1 gap-3">
              <button
                type="button"
                onClick={() => handleRejectAll()}
                id="reject-all"
                className="button button-primary">
                Deny non-essential
              </button>
              <button
                type="button"
                onClick={() => handleAcceptAll()}
                id="accept-all"
                className="button button-primary">
                Accept all
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleManagePreferences()}
              id="manage-preferences"
              className="button button-secondary">
              Manage Individual preferences
            </button>
          </div>
        </div>
      </div>

      <div
        id="cookie-preferences"
        className={`fixed right-8 bottom-8 z-50 max-w-[480px] rounded-2xl border border-solid p-6 ${variant === "docs" ? "border-[#bec2cc] bg-[#212635]" : "border-[#493880] bg-[#161127]"}`}
        style={{ display: mode === "details" ? "block" : "none" }}>
        <div className={styles.preferencesHeader}>
          <h3>Cookie Preferences</h3>
          <button
            type="button"
            onClick={() => {
              setMode("consent");
            }}
            id="close-preferences"
            className="close-button">
            ×
          </button>
        </div>
        <div className="mb-6">
          <div className="cookie-category">
            <label className="cookie-label">
              <div>
                <h4 className="text-white">Essential Cookies</h4>
                <p className="text-[#ffffffbf] text-sm">
                  Required for basic site functionality. These cannot be disabled.
                </p>
              </div>
              <div className="toggle-wrapper">
                <input type="checkbox" id="analytics-cookies" checked disabled />
                <span className="toggle essential" />
              </div>
            </label>
          </div>
          <div className="cookie-category">
            <label className="cookie-label">
              <div>
                <h4 className="text-white">Analytics Cookies</h4>
                <p className="text-[#ffffffbf] text-sm">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <div className="toggle-wrapper">
                <input
                  onChange={(e) => {
                    setPreferences((prevPreferences) => ({
                      ...prevPreferences,
                      analytics: e.target.checked,
                    }));
                  }}
                  type="checkbox"
                  id="analytics-cookies"
                />
                <span className="toggle" />
              </div>
            </label>
          </div>
        </div>
        <button type="button" onClick={handleSavePreferences} className="button button-primary">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
