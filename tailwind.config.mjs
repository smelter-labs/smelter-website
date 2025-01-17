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
			},
			borderRadius: {
				"4xl": "2rem",
			},
			flex:{
				'2': '2 2 0%'
			}
		},
	},
	darkMode: "selector",
};
