import { createRequire } from "node:module";
import path from "node:path";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import starlight from "@astrojs/starlight";
import starlightDocSearch from "@astrojs/starlight-docsearch";
import tailwind from "@astrojs/tailwind";
// @ts-check
import { defineConfig, envField } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import starlightLinksValidator from "starlight-links-validator";
import starlightVersions from "starlight-versions";
import { viteStaticCopy } from "vite-plugin-static-copy";

import react from "@astrojs/react";

import vercel from "@astrojs/vercel";

const require = createRequire(import.meta.url);

export default defineConfig({
  site: "https://smelter.dev",
  env: {
    schema: {
      PUBLIC_RECAPTCHA_SITE_KEY: envField.string({
        access: "public",
        context: "server",
        optional: true,
      }),
    },
  },
  redirects: {
    "/docs": "/fundamentals/getting-started", // TODO: temporary to avoid empty page
    "/fundamentals": "/fundamentals/getting-started",
    "/deployment": "/deployment/setup",
    "/ts-sdk": "/ts-sdk/overview",
    "/ts-sdk/renderers": "/ts-sdk/renderers/overview",
    "/http-api": "/http-api/overview",
    "/http-api/renderers": "/http-api/renderers/overview",
  },
  prefetch: true,
  vite: {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: path.join(
              path.dirname(require.resolve("@swmansion/smelter-browser-render")),
              "smelter.wasm"
            ),
            dest: ".",
          },
        ],
      }),
    ],
    optimizeDeps: {
      exclude: ["@swmansion/smelter-web-wasm"],
      include: ["@swmansion/smelter-web-wasm > pino"],
    },
  },

  integrations: [
    starlight({
      title: "Smelter",
      prerender: false,
      plugins: [
        ...(process.env.ENABLE_LINK_CHECKER ? [starlightLinksValidator()] : []),
        starlightDocSearch({
          appId: "RQGSDUI2B0",
          apiKey: "401cb98bf67c11c44695d30bbba97794",
          indexName: "smelter",
        }),
        starlightVersions({
          versions: [
            {
              slug: "ts-sdk/0.2.x",
              label: "SDK (TypeScript) 0.2.x",
            },
            {
              slug: "http-api/0.4.x",
              label: "Server (HTTP API) 0.4.x",
            },
          ],
        }),
      ],
      description:
        "Low-latency video compositing tool with seamless developer experience. Use it for live streaming, broadcasting, video conferencing and more.",
      social: {
        github: "https://github.com/software-mansion/smelter",
        discord: "https://discord.com/invite/Cxj3rzTTag",
        "x.com": "https://x.com/swmansion",
      },
      favicon: "favicons/favicon.ico",
      customCss: ["./styles/font-face.scss", "./styles/headings.css", "./styles/starlight.scss"],
      logo: {
        light: "./src/assets/navigation/smelter-logo-docs-light.svg",
        dark: "./src/assets/navigation/smelter-logo-docs.svg",
        alt: "Smelter logo",
        replacesTitle: true,
      },
      components: {
        PageFrame: "./src/components/starlight-overrides/PageFrame.astro",
      },
      head: [
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "https://smelter.dev/og-image.png",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:alt",
            content:
              "Low-latency video compositing tool with seamless developer experience. Use it for live streaming, broadcasting, video conferencing and more.",
          },
        },
        {
          tag: "meta",
          attrs: {
            "data-rh": "true",
            name: "keywords",
            content:
              "video compositing, react video compositing, compositing software, real time video editing, live video editing, video mixing, live stream mixing",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "twitter:title",
            content: "Smelter: Real-time video compositing software",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "twitter:description",
            content:
              "Low-latency video compositing tool with seamless developer experience. Use it for live streaming, broadcasting, video conferencing and more.",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "twitter:image”",
            content: "https://smelter.dev/og-image.png",
          },
        },
      ],
      sidebar: [
        {
          label: "Fundamentals",
          items: [
            { label: "Getting started", slug: "fundamentals/getting-started" },
            { label: "Setup Choices", slug: "fundamentals/setup-choices" },
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
            { label: "Benchmarks", slug: "deployment/benchmarks" },
            {
              label: "Variants",
              autogenerate: { directory: "deployment/variants" },
            },
          ],
        },
        {
          label: "TypeScript SDK",
          items: [
            { label: "Overview", slug: "ts-sdk/overview" },
            {
              label: "Runtime",
              items: [
                {
                  label: "Node.js",
                  collapsed: true,
                  autogenerate: { directory: "ts-sdk/nodejs" },
                },
                {
                  label: "Browser (Client)",
                  collapsed: true,
                  autogenerate: { directory: "ts-sdk/web-client" },
                },
                {
                  label: "Browser (WASM)",
                  collapsed: true,
                  autogenerate: { directory: "ts-sdk/web-wasm" },
                },
              ],
            },
            {
              label: "Components",
              collapsed: true,
              items: [
                { slug: "ts-sdk/components/image" },
                { slug: "ts-sdk/components/inputstream" },
                { slug: "ts-sdk/components/mp4" },
                { slug: "ts-sdk/components/rescaler" },
                { slug: "ts-sdk/components/shader" },
                { slug: "ts-sdk/components/show" },
                { slug: "ts-sdk/components/slideshow" },
                { slug: "ts-sdk/components/text" },
                { slug: "ts-sdk/components/tiles" },
                { slug: "ts-sdk/components/view" },
                { slug: "ts-sdk/components/webview" },
                {
                  label: "Props",
                  autogenerate: { directory: "ts-sdk/components/props" },
                },
              ],
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
              label: "Resources",
              collapsed: true,
              autogenerate: { directory: "ts-sdk/resources" },
            },
            {
              label: "Guides",
              collapsed: true,
              autogenerate: { directory: "ts-sdk/guides" },
            },
          ],
        },
        {
          label: "Server - HTTP API",
          items: [
            { label: "Overview", slug: "http-api/overview" },
            { label: "Routes", slug: "http-api/routes" },
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
              label: "Resources",
              collapsed: true,
              autogenerate: { directory: "http-api/resources" },
            },
            {
              label: "Guides",
              collapsed: true,
              autogenerate: { directory: "http-api/guides" },
            },
          ],
        },
      ],
    }),
    mdx(),
    tailwind({ applyBaseStyles: false }),
    react(),
  ],

  markdown: {
    rehypePlugins: [
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
        },
      ],
    ],
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});
