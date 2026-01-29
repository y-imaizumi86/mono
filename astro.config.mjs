// astro.config.mjs

// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [react()],
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