// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/fundamentials': '/fundamentials/getting-started',
    '/deployment': '/deployment/setup',
    '/reference/ts-sdk': '/reference/ts-sdk/overview',
    '/reference/ts-sdk/renderers': '/reference/ts-sdk/renderers/overview',
    '/reference/http-api': '/reference/http-api/overview',
    '/reference/http-api/renderers': '/reference/http-api/renderers/overview',
  },
  integrations: [
    starlight({
      title: 'Live compositor',
      social: {
        github: 'https://github.com/software-mansion/live-compositor',
      },
      sidebar: [
        {
          label: 'Fundamentials',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Getting started', slug: 'fundamentials/getting-started' },
            { label: 'How it works', slug: 'fundamentials/how-it-works' },
            { label: 'Glossary of terms', slug: 'fundamentials/glossary' },
          ],
        },
        {
          label: 'Deployment',
          items: [
            { label: 'Setup', slug: 'deployment/setup' },
            { label: 'Configuration', slug: 'deployment/configuration' },
            {
              label: 'Examples',
              autogenerate: { directory: 'deployment/examples' },
            },
          ],
        },
        {
          label: 'TypeScript SDK',
          items: [
            { label: 'Overview', slug: 'reference/ts-sdk/overview' },
            {
              label: 'Components',
              collapsed: true,
              autogenerate: { directory: 'reference/ts-sdk/components' },
            },
            {
              label: 'Hooks',
              collapsed: true,
              autogenerate: { directory: 'reference/ts-sdk/hooks' },
            },
            {
              label: 'Inputs',
              collapsed: true,
              autogenerate: { directory: 'reference/ts-sdk/inputs' },
            },
            {
              label: 'Outputs',
              collapsed: true,
              autogenerate: { directory: 'reference/ts-sdk/outputs' },
            },
            {
              label: 'Renderers',
              collapsed: true,
              autogenerate: { directory: 'reference/ts-sdk/renderers' },
            },
            {
              label: 'Props',
              collapsed: true,
              autogenerate: { directory: 'reference/ts-sdk/props' },
            },
          ],
        },
        {
          label: 'HTTP API',
          items: [
            { label: 'Overview', slug: 'reference/http-api/overview' },
            {
              label: 'Events',
              slug: 'reference/http-api/events',
            },
            {
              label: 'Components',
              collapsed: true,
              autogenerate: { directory: 'reference/http-api/components' },
            },
            {
              label: 'Inputs',
              collapsed: true,
              autogenerate: { directory: 'reference/http-api/inputs' },
            },
            {
              label: 'Outputs',
              collapsed: true,
              autogenerate: { directory: 'reference/http-api/outputs' },
            },
            {
              label: 'Renderers',
              collapsed: true,
              autogenerate: { directory: 'reference/http-api/renderers' },
            },
          ],
        },
      ],
    }),
    tailwind(),
    react(),
    mdx(),
  ],
});
