import { build } from 'vite';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Compile pure gameplay modules in-process so these checks need no browser or worker processes.
const output = resolve('test-results/systems');
await build({
  configFile: false,
  logLevel: 'error',
  resolve: { preserveSymlinks: true },
  build: {
    ssr: 'tests/unit/systems.test.ts',
    target: 'node22',
    outDir: output,
    emptyOutDir: false,
    rollupOptions: { output: { entryFileNames: 'systems.mjs' } },
  },
});
await import(pathToFileURL(resolve(output, 'systems.mjs')).href);
