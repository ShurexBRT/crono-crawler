import { TextureKeys } from '../assets/manifest';
import { BootScene } from './scenes/BootScene';

const heavyweightReactorKeys = new Set<string>([
  TextureKeys.reactorFarPast,
  TextureKeys.reactorFarPresent,
  TextureKeys.reactorFarFuture,
  TextureKeys.reactorMidPast,
  TextureKeys.reactorMidPresent,
  TextureKeys.reactorMidFuture,
  TextureKeys.reactorForeground,
]);

const transparentSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"></svg>`;

const proto = BootScene.prototype as any;
const productionPreload = proto.preload;

proto.preload = function optimizedProductionPreload(this: BootScene): void {
  const loader = this.load as any;
  const originalSvg = loader.svg;
  const transparentDataUri = `data:image/svg+xml;base64,${btoa(transparentSvg)}`;

  loader.svg = function optimizedSvgLoad(key: string, url: string, config?: unknown): unknown {
    if (heavyweightReactorKeys.has(key)) {
      return originalSvg.call(loader, key, transparentDataUri, { width: 16, height: 16 });
    }
    return originalSvg.call(loader, key, url, config);
  };

  try {
    productionPreload.call(this);
  } finally {
    loader.svg = originalSvg;
  }
};
