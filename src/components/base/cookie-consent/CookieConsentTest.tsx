import { useEffect, useState } from "react";
import clarity from "react-microsoft-clarity";
import "../../../../styles/global.scss";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
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

  const variant = "docs";

  return (
    <div
      id="cookie-consent"
      className="fixed right-8 bottom-0 max-w-lg rounded-xl border border-[#493880] bg-[#161127]/90 p-6 shadow-xl backdrop-blur-lg transition-all duration-300"
      style={{ display: isVisible ? "block" : "none" }}>
      <div
        id="cookie-banner"
        className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <div className="flex-1 text-white">
          <h3>We use cookies</h3>
          <p>
            We use cookies to persist your settings and analyze our traffic. Please select your
            preferences.
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleRejectAll}
              className="bg-[#624baa] hover:bg-[#493880] text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Deny non-essential
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="bg-[#624baa] hover:bg-[#493880] text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Accept all
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="bg-[#302555] hover:bg-[#493880] text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Manage Individual preferences
          </button>
        </div>
      </div>
    </div>
  );
}
