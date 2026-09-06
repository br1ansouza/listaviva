import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';

const rootDir = dirname(fileURLToPath(import.meta.url));
const WEB_PORT = Number(process.env.PORT ?? 5173);
const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3000';

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
    title: 'ListaViva',
    meta: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      description: 'Listas colaborativas em tempo real, sem cadastro, compartilhadas por link.',
    },
    tags: [
      { tag: 'link', attrs: { rel: 'manifest', href: 'manifest.webmanifest' } },
      { tag: 'link', attrs: { rel: 'icon', type: 'image/svg+xml', href: 'icons/mark.svg' } },
      { tag: 'link', attrs: { rel: 'apple-touch-icon', href: 'icons/apple-touch-icon.png' } },
    ],
  },
  server: {
    host: '0.0.0.0',
    port: WEB_PORT,
    strictPort: true,
  },
});
