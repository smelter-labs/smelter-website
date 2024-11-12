import { COLORS } from '../colors';

export const LIGHT_THEME = {
  colors: {
    mainBackground: COLORS.white100,
    nav: {
      icon: COLORS.white100,
      searchContent: COLORS.white100,
      searchBorder: COLORS.white25,
    },
    hero: {
      title: COLORS.black100,
      subtitle: COLORS.secondary60,
      authorLabel: COLORS.black100,
      docsButton: COLORS.black100,
      docsGradientFrom: COLORS.secondary100,
      docsGradientTo: COLORS.primary100,
    },
    form: {
      header: COLORS.black100,
      border: COLORS.white25,
      label: COLORS.black100,
    },
    footer: {
      logo: COLORS.black100,
      copyright: COLORS.black100,
    },
  },
} as const;
