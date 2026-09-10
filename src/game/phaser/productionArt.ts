import type Phaser from 'phaser';
import { AnimationKeys, TextureKeys } from '../assets/manifest';
import { doorSvg, memoryFragmentSvg, plateSvg, platformSvg, rustmiteSvg, svgDataUri, switchSvg, temporalAnchorSvg } from '../assets/productionGameplaySvg';
import type { TimelineKey } from '../types';

export const productionPlatforms: Record<TimelineKey, string> = {
  past: TextureKeys.productionPlatformPast,
  present: TextureKeys.productionPlatformPresent,
  future: TextureKeys.productionPlatformFuture,
};

export function loadProductionTextures(scene: Phaser.Scene): void {
  scene.load.svg(TextureKeys.productionCheckpoint, svgDataUri(temporalAnchorSvg()), { width: 192, height: 256 });
  scene.load.svg(TextureKeys.productionMemoryFragment, svgDataUri(memoryFragmentSvg()), { width: 128, height: 160 });
  scene.load.svg(TextureKeys.productionRustmiteA, svgDataUri(rustmiteSvg(0)), { width: 128, height: 96 });
  scene.load.svg(TextureKeys.productionRustmiteB, svgDataUri(rustmiteSvg(2)), { width: 128, height: 96 });
  scene.load.svg(TextureKeys.productionRustmiteAlert, svgDataUri(rustmiteSvg(1, true)), { width: 128, height: 96 });
  const keys = {
    past: [TextureKeys.productionDoorPast, TextureKeys.productionPlatePast, TextureKeys.productionSwitchPastOff, TextureKeys.productionSwitchPastOn],
    present: [TextureKeys.productionDoorPresent, TextureKeys.productionPlatePresent, TextureKeys.productionSwitchPresentOff, TextureKeys.productionSwitchPresentOn],
    future: [TextureKeys.productionDoorFuture, TextureKeys.productionPlateFuture, TextureKeys.productionSwitchFutureOff, TextureKeys.productionSwitchFutureOn],
  };
  for (const timeline of ['past', 'present', 'future'] as const) {
    const [door, plate, off, on] = keys[timeline];
    scene.load.svg(productionPlatforms[timeline], svgDataUri(platformSvg(timeline)), { width: 512, height: 96 });
    scene.load.svg(door, svgDataUri(doorSvg(timeline)), { width: 192, height: 288 });
    scene.load.svg(plate, svgDataUri(plateSvg(timeline)), { width: 160, height: 48 });
    scene.load.svg(off, svgDataUri(switchSvg(timeline, false)), { width: 96, height: 128 });
    scene.load.svg(on, svgDataUri(switchSvg(timeline, true)), { width: 96, height: 128 });
  }
}

export function registerProductionAnimations(scene: Phaser.Scene): void {
  if (!scene.anims.exists(AnimationKeys.rustmitePatrol)) {
    scene.anims.create({ key: AnimationKeys.rustmitePatrol, frames: [{ key: TextureKeys.productionRustmiteA }, { key: TextureKeys.productionRustmiteB }], frameRate: 5, repeat: -1 });
  }
  if (!scene.anims.exists(AnimationKeys.rustmiteAlert)) {
    scene.anims.create({ key: AnimationKeys.rustmiteAlert, frames: [{ key: TextureKeys.productionRustmiteAlert }], frameRate: 1, repeat: -1 });
  }
}
