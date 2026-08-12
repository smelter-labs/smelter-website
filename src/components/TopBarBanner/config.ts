import type { BannerZone } from "./shared";

const FALLBACK_BG = "linear-gradient(135deg, #F24664 0%, #302555 100%)";

export const TOP_BAR_BANNER = {
  rotateIntervalMs: 4000,
  hiddenPaths: [] as string[],
  zones: [
    {
      zoneId: "smelter-topbar-1",
      contentId: "ea15c4216158c4097b65fe6504a4b3b7",
      fallbackBgColor: FALLBACK_BG,
    },
    {
      zoneId: "smelter-topbar-2",
      contentId: "ea15c4216158c4097b65fe6504a4b3b7",
      fallbackBgColor: FALLBACK_BG,
    },
    {
      zoneId: "smelter-topbar-3",
      contentId: "ea15c4216158c4097b65fe6504a4b3b7",
      fallbackBgColor: FALLBACK_BG,
    },
  ] satisfies BannerZone[],
};
