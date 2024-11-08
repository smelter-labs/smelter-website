import { COLORS } from '../colors';

export const DARK_THEME = {
  colors: {
    mainBackground: COLORS.black100,
    nav: {
      icon: COLORS.white100,
      searchContent: COLORS.white100,
      searchBorder: COLORS.white25,
    },
    hero: {
      title: COLORS.white100,
      subtitle: COLORS.secondary60,
      authorLabel: COLORS.white100,
      docsButton: COLORS.white100,
      docsGradientFrom: COLORS.secondary100,
      docsGradientTo: COLORS.primary100,
    },
  },
} as const;
