import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // base: '/web-app/',
  define: {
    'process.env': {}, // Avoid directly using `process.env` unless necessary
  },
  // base: '/', // Subfolder path
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "mask-icon.svg"],
      manifest: {
        name: "FastWork24",
        short_name: "FastWork24",
        description: "FastWork24 user app and admin dashboard",
        theme_color: "#047857",
        background_color: "#ecfdf5",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "favicon.svg",
            sizes: "64x64",
            type: "image/svg+xml",
          },
          {
            src: "mask-icon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
      injectRegister: "auto",
      strategies: "generateSW",
    }),
  ],
  base: '/', // Subfolder path
  resolve: {
    alias: {
      '@tailwindConfig': path.resolve(__dirname, 'tailwind.config.js'),
    },
  },
  optimizeDeps: {
    include: ['@tailwindConfig'],
  },
  build: {
    minify: true,
    sourcemap: false,
    target: 'esnext', // ✅ FIXED
  },
});
