import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { LevelData } from '../types';
import { GameScene } from './scenes/GameScene';

const previousPlatformKeys = new Set<string>([
  TextureKeys.productionPlatformPast,
  TextureKeys.productionPlatformPresent,
  TextureKeys.productionPlatformFuture,
]);

type RebuildScene = Phaser.Scene & {
  level: LevelData;
};

const proto = GameScene.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
const previousBuildLevel = proto.buildLevel;

proto.buildLevel = function preferNewFoldedReactorPlatforms(this: RebuildScene): void {
  previousBuildLevel.call(this);
  if (this.level.id !== 'tutorial') return;

  this.children.list.forEach((child) => {
    if (!(child instanceof Phaser.GameObjects.Image)) return;

    const key = child.texture.key;
    const oldSheetVisual = key === TextureKeys.platformSheet && child.depth >= 7.9 && child.depth <= 9.3;
    const oldSingleImageVisual = previousPlatformKeys.has(key) && child.depth >= 8.55 && child.depth <= 9.8;

    if (oldSheetVisual || oldSingleImageVisual) {
      child.setVisible(false).setAlpha(0);
      child.setData('replaced-by-modular-platform-renderer', true);
    }
  });
};
