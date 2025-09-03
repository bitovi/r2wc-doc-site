// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  vite: {
      server: {
          allowedHosts: [
              "localhost",
              "127.0.0.1",
              ".ngrok-free.app",
          ]
      }
	},

  integrations: [
      starlight({
          title: 'React to Web Component',
          social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/bitovi/react-to-web-component' }],
          
          sidebar: [
              {
                  label: 'API',
                  items: [
                      // Each item here is one entry in the navigation menu.
                      { label: 'Full API', slug: 'api/api' },
                      { label: 'Complete Example', slug: 'api/complete-example' },
                      { label: 'Programmatic Usage', slug: 'api/programatic-usage' },
                  ],
              },
              {
                  label: 'Guides',
                  items: [
                      // Each item here is one entry in the navigation menu.
                      { label: 'Building with Vite', slug: 'guides/building-with-vite' },
                      { label: 'R2WC in React', slug: 'guides/r2wc-in-react' },
                      { label: 'Typescript', slug: 'guides/typescript' },
                  ],
              },
              {
                  label: 'Bitovi',
                  slug: "about",
                  badge: ""
              },
          ],
      }),
	],

  adapter: cloudflare(),
});