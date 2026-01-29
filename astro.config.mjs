// astro.config.mjs

// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Mono Shopping List',
        short_name: 'Mono',
        description: '家族の買い物リスト',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        navigateFallback: '/',
      },
    }),
  ],
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: "polyfill-message-channel-banner",
        apply: "build",
        enforce: "pre",
        config(userConfig, { isSsrBuild }) {
          if (isSsrBuild) {
            return {
              build: {
                rollupOptions: {
                  output: {
                    banner: `
                      globalThis.MessageChannel = globalThis.MessageChannel || class MessageChannel {
                        constructor() {
                          this.port1 = { onmessage: null, postMessage: (data) => { if (this.port2.onmessage) this.port2.onmessage({ data }); } };
                          this.port2 = { onmessage: null, postMessage: (data) => { if (this.port1.onmessage) this.port1.onmessage({ data }); } };
                        }
                      };
                    `,
                  },
                },
              },
            };
          }
        },
      },
    ],
  },
});