import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";

// @ts-check
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export default defineConfig({
	redirects: {
		"/fundamentals": "/fundamentals/getting-started",
		"/deployment": "/deployment/setup",
		"/ts-sdk": "/ts-sdk/overview",
		"/ts-sdk/renderers": "/ts-sdk/renderers/overview",
		"/http-api": "/http-api/overview",
		"/http-api/renderers": "/http-api/renderers/overview",
	},
	experimental: {
		svg: true,
	},
	integrations: [
		starlight({
			title: "Smelter",
			social: {
				github: "https://github.com/software-mansion/smelter",
			},
			customCss: ["./styles/headings.css"],
			sidebar: [
				{
					label: "Fundamentals",
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: "Getting started", slug: "fundamentals/getting-started" },
						{ label: "How it works", slug: "fundamentals/how-it-works" },
						{ label: "Glossary of terms", slug: "fundamentals/glossary" },
						{
							label: "Concepts",
							autogenerate: { directory: "fundamentals/concepts" },
						},
					],
				},
				{
					label: "Deployment",
					items: [
						{ label: "Setup", slug: "deployment/setup" },
						{ label: "Configuration", slug: "deployment/configuration" },
						{
							label: "Examples",
							autogenerate: { directory: "deployment/examples" },
						},
					],
				},
				{
					label: "TypeScript SDK",
					items: [
						{ label: "Overview", slug: "ts-sdk/overview" },
						{ label: "Smelter", slug: "ts-sdk/smelter" },
						{
							label: "Components",
							collapsed: true,
							autogenerate: { directory: "ts-sdk/components" },
						},
						{
							label: "Hooks",
							collapsed: true,
							autogenerate: { directory: "ts-sdk/hooks" },
						},
						{
							label: "Inputs",
							collapsed: true,
							autogenerate: { directory: "ts-sdk/inputs" },
						},
						{
							label: "Outputs",
							collapsed: true,
							autogenerate: { directory: "ts-sdk/outputs" },
						},
						{
							label: "Renderers",
							collapsed: true,
							autogenerate: { directory: "ts-sdk/renderers" },
						},
						{
							label: "Props",
							collapsed: true,
							autogenerate: { directory: "ts-sdk/props" },
						},
						{
							label: "Guides",
							collapsed: true,
							autogenerate: { directory: "ts-sdk/guides" },
						},
					],
				},
				{
					label: "HTTP API",
					items: [
						{ label: "Overview", slug: "http-api/overview" },
						{
							label: "Events",
							slug: "http-api/events",
						},
						{
							label: "Components",
							collapsed: true,
							autogenerate: { directory: "http-api/components" },
						},
						{
							label: "Inputs",
							collapsed: true,
							autogenerate: { directory: "http-api/inputs" },
						},
						{
							label: "Outputs",
							collapsed: true,
							autogenerate: { directory: "http-api/outputs" },
						},
						{
							label: "Renderers",
							collapsed: true,
							autogenerate: { directory: "http-api/renderers" },
						},
					],
				},
			],
		}),
		mdx(),
		tailwind(),
	],

	markdown: {
		rehypePlugins: [
			rehypeHeadingIds,
			[
				rehypeAutolinkHeadings,
				{
					// Wrap the heading text in a link.
					behavior: "wrap",
				},
			],
		],
	},
});
