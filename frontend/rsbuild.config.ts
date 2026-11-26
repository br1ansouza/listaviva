import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

const rootDir = dirname(fileURLToPath(import.meta.url));
const WEB_PORT = Number(process.env.PORT ?? 5173);
const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3000';
const SITE_URL = (
  process.env.PUBLIC_SITE_URL ?? 'https://listaviva.br1ansouza.workers.dev'
).replace(/\/$/, '');
const SITE_DESCRIPTION =
  'Listas colaborativas em tempo real, sem cadastro, compartilhadas por link.';

export default defineConfig({
  plugins: [pluginReact(), pluginTailwindcss()],
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src'),
    },
  },
  source: {
    entry: {
      index: './src/app/main.tsx',
    },
    define: {
      'process.env.PUBLIC_API_URL': JSON.stringify(API_URL),
    },
  },
  performance: {
    chunkSplit: {
      strategy: 'split-by-experience',
    },
  },
  html: {
    template: './src/index.html',
    title: 'ListaViva',
    meta: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      description: SITE_DESCRIPTION,
      'og:type': { property: 'og:type', content: 'website' },
      'og:site_name': { property: 'og:site_name', content: 'ListaViva' },
      'og:title': { property: 'og:title', content: 'ListaViva — combine agora, resolva junto' },
      'og:description': { property: 'og:description', content: SITE_DESCRIPTION },
      'og:image': { property: 'og:image', content: `${SITE_URL}/og.png` },
      'og:image:width': { property: 'og:image:width', content: '1200' },
      'og:image:height': { property: 'og:image:height', content: '630' },
      'og:locale': { property: 'og:locale', content: 'pt_BR' },
      'twitter:card': 'summary_large_image',
    },
    tags: [
      { tag: 'link', attrs: { rel: 'manifest', href: 'manifest.webmanifest' } },
      { tag: 'link', attrs: { rel: 'icon', type: 'image/svg+xml', href: 'icons/mark.svg' } },
      { tag: 'link', attrs: { rel: 'apple-touch-icon', href: 'icons/apple-touch-icon.png' } },
      {
        tag: 'meta',
        attrs: { name: 'theme-color', content: '#FBF9F3', media: '(prefers-color-scheme: light)' },
      },
      {
        tag: 'meta',
        attrs: { name: 'theme-color', content: '#141516', media: '(prefers-color-scheme: dark)' },
      },
      { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
      { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: 'ListaViva' } },
    ],
  },
  server: {
    host: '0.0.0.0',
    port: WEB_PORT,
    strictPort: true,
  },
});
