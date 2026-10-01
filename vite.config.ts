import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Sur GitHub Pages le site est servi sous /<nom-du-repo>/.
// VITE_BASE est injecté par le workflow ; en local on reste sur "/".
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'HEC Launchpad',
        short_name: 'Launchpad',
        description: 'Idées, cofondateurs et votes de la promo Launchpad HEC',
        lang: 'fr',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#0B1F4B',
        theme_color: '#0B1F4B',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: `${base}index.html`,
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
})
