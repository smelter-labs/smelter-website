export function isChromiumBased() {
  if (typeof window !== "undefined") {
    const deviceType = navigator.userAgent;
    const isChromium =
      deviceType.includes("Chrome") ||
      deviceType.includes("Chromium") ||
      deviceType.includes("CriOS");
    return isChromium;
  }
  return 'loading';
}

export function isMobileBreakpoint() {
  if (typeof window !== "undefined") {
    const mobileBreakpointWidth = 768;
    return window.innerWidth <= mobileBreakpointWidth;
  }
  return 'loading';
}