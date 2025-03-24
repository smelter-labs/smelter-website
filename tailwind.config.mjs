import { DARK_THEME } from "./styles/themes/darkTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      aeonik: ["Aeonik"],
    },
    extend: {
      colors: {
        ...DARK_THEME.colors,
      },
      spacing: {
        17.5: "4.375rem",
        18: "4.5rem",
        "1/6": "16.666667%",
      },
      backgroundImage: {
        "gradient-red-5": "linear-gradient(135deg, #F24664 0%, #302555 100%)",
      },
      boxShadow: {
        "2xl": "0 13px 26px -7px rgba(0, 0, 0, 0.3)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      flex: {
        1.5: "1.5 1.5 0%",
        2: "2 2 0%",
        2.5: "2.5 2.5 0%",
        3: "3 3 0%",
        3.5: "3.5 3.5 0%",
      },
    },
  },
  darkMode: "selector",
};
