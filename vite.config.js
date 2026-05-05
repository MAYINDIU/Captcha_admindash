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
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "PLEASURE BANGLADESH",
        short_name: "PBD",
        description: "PLEASURE BANGLADESH",
        theme_color: "#1a1a2e",
        background_color: "#16213e",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
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
