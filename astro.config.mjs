// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
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
          ],
        },
        {
          label: 'Components',
          autogenerate: { directory: 'components' },
        },
      ],
    }),
    tailwind(),
    react(),
  ],
});
