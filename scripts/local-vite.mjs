import { build, createServer } from 'vite';
import config from '../vite.config.ts';

// Local drives need no Windows mapped-drive subprocess probe.
const localConfig = { ...config, configFile: false, resolve: { preserveSymlinks: true } };
if (process.argv.includes('build')) {
  await build(localConfig);
} else {
  const requestedPort = process.argv.find((argument) => argument.startsWith('--port='));
  const port = requestedPort ? Number(requestedPort.slice('--port='.length)) : 5173;
  const server = await createServer({ ...localConfig, server: { ...config.server, host: '127.0.0.1', port, strictPort: true } });
  await server.listen();
  server.printUrls();
}
