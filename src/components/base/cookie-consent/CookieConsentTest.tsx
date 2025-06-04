import { useEffect, useState } from "react";
import clarity from "react-microsoft-clarity";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
  });

  useEffect(() => {
    clarity.clarity.init("rr6q6gt4xx")
    // Emulating fetching user's saved cookie preferences from local storage
    const savedPreferences = JSON.parse(localStorage.getItem("cookiePreferences"));
    if (savedPreferences) {
      setPreferences(savedPreferences);
      setIsVisible(false);
    } else {
      setIsVisible(true);
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
    setIsVisible(false);
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
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    setIsVisible(false);
  };

  const handleManagePreferences = () => {
    setIsVisible(true);
  };

  return (
    <div
      id="cookie-consent"
      style={{
        display: isVisible ? "block" : "none",
        width: "600px",
        height: "300px",
        backgroundColor: "red",
        position: "fixed",
        bottom: 0,
        right: 0,
      }}>
      <div id="cookie-banner">
        <h3>We use cookies</h3>
        <p>
          We use cookies to persist your settings and analyze our traffic. Please select your
          preferences.
        </p>
        <button type="button" onClick={handleRejectAll}>
          Deny non-essential
        </button>
        <button type="button" onClick={handleAcceptAll}>
          Accept all
        </button>
        <button type="button" onClick={() => setIsVisible(!isVisible)}>
          Manage Individual preferences
        </button>
      </div>

      <div id="cookie-preferences" style={{ display: isVisible ? "block" : "none" }}>
        <h3>Cookie Preferences</h3>
        <button type="button" onClick={() => setIsVisible(false)}>
          Close
        </button>
        <div>
          <label>
            <span>Analytics Cookies</span>
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
            />
          </label>
        </div>
        <button type="button" onClick={handleSavePreferences}>
          Save Preferences
        </button>
      </div>
    </div>
  );
}
