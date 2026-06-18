import { createReadStream, cpSync, existsSync, statSync } from 'node:fs';
import { extname, normalize, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const assetRoot = resolve(__dirname, 'assets');
const distAssetRoot = resolve(__dirname, 'dist/assets');

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
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
