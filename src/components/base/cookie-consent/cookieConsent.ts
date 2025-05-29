type Consent = {
  essential: boolean;
  analytics: boolean;
  timestamp: number;
};

type ConsentCookies = keyof Omit<Consent, "timestamp">;

class CookieConsent {
  consentKey: string;
  constructor() {
    this.consentKey = "cookie-consent";
    this.init();
  }

  init() {
    const existingConsent = this.getConsent();

    if (!existingConsent) {
      this.showConsentBanner();
    } else {
      this.showSettingsTrigger();
      this.applyCookieSettings(existingConsent);
    }

    this.bindEvents();
  }

  bindEvents() {
    const acceptAllBtn = document.getElementById("accept-all");
    const rejectAllBtn = document.getElementById("reject-all");
    const manageBtn = document.getElementById("manage-preferences");
    const saveBtn = document.getElementById("save-preferences");
    const closeBtn = document.getElementById("close-preferences");

    acceptAllBtn?.addEventListener("click", () => this.acceptAll());
    rejectAllBtn?.addEventListener("click", () => this.rejectAll());
    manageBtn?.addEventListener("click", () => this.showPreferences());
    saveBtn?.addEventListener("click", () => this.saveSelected());
    closeBtn?.addEventListener("click", () => this.hidePreferences());
  }

  showConsentBanner() {
    const banner = document.getElementById("cookie-consent");
    const bannerContent = document.getElementById("cookie-banner");
    const preferences = document.getElementById("cookie-preferences");

    banner?.style.setProperty("display", "block");
    bannerContent?.style.setProperty("display", "block");
    preferences?.style.setProperty("display", "none");

    this.hideSettingsTrigger();
  }

  hideConsentBanner() {
    const banner = document.getElementById("cookie-consent");
    banner?.style.setProperty("display", "none");
    this.showSettingsTrigger();
  }

  showPreferences() {
    const bannerContent = document.getElementById("cookie-banner");
    const preferences = document.getElementById("cookie-preferences");

    bannerContent?.style.setProperty("display", "none");
    preferences?.style.setProperty("display", "block");
  }

  hidePreferences() {
    const bannerContent = document.getElementById("cookie-banner");
    const preferences = document.getElementById("cookie-preferences");

    console.log("PREFERENCES ", preferences);
    bannerContent?.style.setProperty("display", "block");
    preferences?.style.setProperty("display", "none");
  }

  showSettingsTrigger() {
    const trigger = document.getElementById("cookie-settings-trigger");
    trigger?.style.setProperty("display", "block");
  }

  hideSettingsTrigger() {
    const trigger = document.getElementById("cookie-settings-trigger");
    trigger?.style.setProperty("display", "none");
  }

  acceptAll() {
    const consent = {
      essential: true,
      analytics: true,
      timestamp: Date.now(),
    };

    window.clarity('consent');
    this.saveConsent(consent);
    this.applyCookieSettings(consent);
    this.hideConsentBanner();
  }

  rejectAll() {
    const consent = {
      essential: true,
      analytics: false,
      timestamp: Date.now(),
    };

    window.clarity('consent', false)
    this.saveConsent(consent);
    this.applyCookieSettings(consent);
    this.hideConsentBanner();
  }

  saveSelected() {
    const consent: Consent = {
      essential: true,
      analytics:
        (document.getElementById("analytics-cookies") as HTMLInputElement)?.checked || false,
      timestamp: Date.now(),
    };

    if(!(document.getElementById("analytics-cookies") as HTMLInputElement)?.checked) {
      window.clarity('consent', false)
    }

    this.saveConsent(consent);
    this.applyCookieSettings(consent);
    this.hideConsentBanner();
  }

  saveConsent(consent: Consent) {
    localStorage.setItem(this.consentKey, JSON.stringify(consent));

    window.dispatchEvent(
      new CustomEvent("cookieConsentUpdated", {
        detail: consent,
      })
    );
  }

  getConsent() {
    try {
      const stored = localStorage.getItem(this.consentKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  applyCookieSettings(consent: Consent) {
    const analyticsCheckbox = document.getElementById("analytics-cookies") as HTMLInputElement;

    if (analyticsCheckbox) analyticsCheckbox.checked = consent.analytics;
  }

  static isAllowed(cookieType: ConsentCookies) {
    try {
      const consent = JSON.parse(localStorage.getItem("cookie-consent") || "{}");
      return consent[cookieType] === true;
    } catch {
      return false;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new CookieConsent());
} else {
  new CookieConsent();
}
