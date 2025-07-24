import { COLORS } from "../colors";

export const DARK_THEME = {
  colors: {
    mainBackground: COLORS.black100,
    link: COLORS.red40,
    switchActive: COLORS.green100,
    loadingFill: COLORS.red60,
    buttonTab: {
      border: COLORS.purple20
    },
    nav: {
      icon: COLORS.white100,
      searchContent: COLORS.white100,
      searchBorder: COLORS.white25,
      link: COLORS.white100,
    },
    hero: {
      title: COLORS.white100,
      subtitle: COLORS.purple20,
      authorLabel: COLORS.white100,
      docsButton: COLORS.white100,
      docsGradientFrom: COLORS.red40,
      docsGradientTo: COLORS.purple100,
    },
    gradient: {
      red: COLORS.red40,
      purple: COLORS.purple100,
      redLight: COLORS.red0,
      black: COLORS.black100,
    },
    explanation: {
      header: COLORS.white100,
      text: COLORS.white100,
      background: COLORS.black100,
    },
    useCases: {
      header: COLORS.white100,
      subheader: COLORS.purple20,
      tileHeader: COLORS.white100,
      tileSubheader: COLORS.purple20,
      tileBackground: COLORS.black100,
      tileBackgroundOpacity: COLORS.black75,
      borderInactive: COLORS.white25,
    },
    usage: {
      header: COLORS.white100,
      subheader: COLORS.purple20,
      tileHeader: COLORS.white100,
      tileText: COLORS.white100,
      hoverBackground: COLORS.black75,
      hoverText: COLORS.red40,
      reactButton: COLORS.react50,
      reactHover: COLORS.react100,
    },
    example: {
      border: COLORS.white25,
      link: COLORS.purple20,
    },
    capabilities: {
      header: COLORS.white100,
      subheader: COLORS.purple20,
      background: COLORS.black75,
      text: COLORS.white100,
      border: COLORS.white25,
    },
    homeLicense: {
      header: COLORS.white100,
      subheader: COLORS.purple20,
      border: COLORS.white25,
    },
    form: {
      header: COLORS.white100,
      subtitle: COLORS.purple20,
      border: COLORS.white25,
      label: COLORS.white100,
    },
    footer: {
      logo: COLORS.white100,
      copyright: COLORS.white100,
      text: COLORS.white100,
      link: COLORS.purple20,
      linkHover: COLORS.red40,
    },
    testimonials: {
      header: COLORS.white100,
      content: COLORS.purple20,
      caption: COLORS.white100,
    },
    ai: {
      header: COLORS.white100,
      content: COLORS.purple20,
      caption: COLORS.white100,
      border: COLORS.white25,
    },
    license: {
      content: COLORS.white100,
    },
    snackbar: {
      background: COLORS.black90,
      header: COLORS.white100,
      border: COLORS.green60,
      borderOpacity: COLORS.white25,
      content: COLORS.white75,
    },
    demos: {
      header: COLORS.white100,
      subheader: COLORS.purple20,
      border: COLORS.white100,
      background: COLORS.black100,
      button: COLORS.red40,
      buttonText: COLORS.white100,
      text: COLORS.white100,
      inputLabel: COLORS.white100,
      userSettingsTileBackground: COLORS.gray50,
    },
  },
} as const;
