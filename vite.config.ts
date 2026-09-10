import { createReadStream, cpSync, existsSync, statSync } from 'node:fs';
import { extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const assetRoot = resolve(projectRoot, 'assets');
const distAssetRoot = resolve(projectRoot, 'dist/assets');

function chronoCrawlerAssets(): Plugin {
  return {
    name: 'chrono-crawler-assets',
    configureServer(server) {
      server.middlewares.use('/assets', (request, response, next) => {
        const requestUrl = request.url?.split('?')[0] ?? '';
        const assetPath = normalize(resolve(assetRoot, `.${decodeURIComponent(requestUrl)}`));

        if (!assetPath.startsWith(assetRoot) || !existsSync(assetPath) || !statSync(assetPath).isFile()) {
          next();
          return;
        }

        response.setHeader('Content-Type', mimeType(assetPath));
        createReadStream(assetPath).pipe(response);
      });
    },
    closeBundle() {
      if (existsSync(assetRoot)) {
        cpSync(assetRoot, distAssetRoot, { recursive: true });
      }
    },
  };
}

function mimeType(filePath: string): string {
  if (extname(filePath).toLowerCase() === '.png') {
    return 'image/png';
  }
  return 'application/octet-stream';
}

export default defineConfig({
  base: './',
  plugins: [chronoCrawlerAssets()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1300,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) {
            return 'phaser';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
