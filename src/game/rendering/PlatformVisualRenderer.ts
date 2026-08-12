import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { PlatformVisualFamily, RectSpec, TimelineKey } from '../types';

const MODULE_WIDTH = 128;
const TOP_STRIP_HEIGHT = 5;

const textureForTimeline = (timeline: TimelineKey): string => {
  if (timeline === 'past') return TextureKeys.productionPlatformPast;
  if (timeline === 'future') return TextureKeys.productionPlatformFuture;
  return TextureKeys.productionPlatformPresent;
};

const accentForTimeline = (timeline: TimelineKey): number => {
  if (timeline === 'past') return 0xe0a443;
  if (timeline === 'future') return 0xe05a8a;
  return 0x48cee8;
};

const supportColorForTimeline = (timeline: TimelineKey): number => {
  if (timeline === 'past') return 0x6d4721;
  if (timeline === 'future') return 0x431a2b;
  return 0x183847;
};

export interface PlatformVisualOptions {
  family?: PlatformVisualFamily;
  depth?: number;
  timeline?: TimelineKey;
}

/**
 * Presentation-only renderer for authored platform visuals.
 * Collision remains owned by the rectangle entity / levels.ts geometry.
 */
export class PlatformVisualRenderer {
  private readonly scene: Phaser.Scene;
  private readonly rect: RectSpec;
  private readonly family: PlatformVisualFamily;
  private readonly depth: number;
  private readonly root: Phaser.GameObjects.Container;
  private readonly moduleImages: Phaser.GameObjects.Image[] = [];
  private readonly accentBars: Phaser.GameObjects.Rectangle[] = [];
  private readonly supportGraphics: Phaser.GameObjects.Graphics;
  private timeline: TimelineKey;

  constructor(scene: Phaser.Scene, rect: RectSpec, options: PlatformVisualOptions = {}) {
    this.scene = scene;
    this.rect = rect;
    this.family = options.family ?? inferFamily(rect);
    this.depth = options.depth ?? 8;
    this.timeline = options.timeline ?? 'present';
    this.root = scene.add.container(0, 0).setDepth(this.depth);
    this.supportGraphics = scene.add.graphics().setDepth(this.depth - 0.03);
    this.root.add(this.supportGraphics);

    this.build();
    this.setTimeline(this.timeline);
  }

  setTimeline(timeline: TimelineKey): void {
    this.timeline = timeline;
    const texture = textureForTimeline(timeline);
    const accent = accentForTimeline(timeline);

    for (const image of this.moduleImages) {
      if (this.scene.textures.exists(texture)) {
        image.setTexture(texture);
        image.clearTint();
      } else {
        image.setTint(accent);
      }
    }

    for (const bar of this.accentBars) {
      bar.setFillStyle(accent, timeline === 'future' ? 0.7 : 0.78);
    }

    this.drawSupports();
  }

  setVisible(visible: boolean): void {
    this.root.setVisible(visible);
  }

  setAlpha(alpha: number): void {
    this.root.setAlpha(alpha);
  }

  setTint(tint?: number): void {
    for (const image of this.moduleImages) {
      if (tint === undefined) image.clearTint();
      else image.setTint(tint);
    }
  }

  destroy(): void {
    this.root.destroy(true);
  }

  private build(): void {
    const topY = this.rect.y - this.rect.height / 2;
    const visualHeight = platformFaceHeight(this.family, this.rect.height);
    const moduleCount = Math.max(1, Math.ceil(this.rect.width / MODULE_WIDTH));
    const left = this.rect.x - this.rect.width / 2;

    for (let index = 0; index < moduleCount; index += 1) {
      const moduleLeft = left + index * MODULE_WIDTH;
      const remaining = this.rect.width - index * MODULE_WIDTH;
      const width = Math.min(MODULE_WIDTH, remaining);
      const centerX = moduleLeft + width / 2;

      const texture = textureForTimeline(this.timeline);
      const image = this.scene.add.image(centerX, topY, texture);
      image.setOrigin(0.5, 0);
      image.setDisplaySize(width + 1, visualHeight);
      image.setDepth(this.depth);
      this.root.add(image);
      this.moduleImages.push(image);

      if (index === 0 || index === moduleCount - 1) {
        const capWidth = Math.min(8, Math.max(4, width * 0.08));
        const capX = index === 0 ? moduleLeft + capWidth / 2 : moduleLeft + width - capWidth / 2;
        const cap = this.scene.add.rectangle(capX, topY + visualHeight * 0.48, capWidth, visualHeight * 0.88, 0x080b0f, 0.66);
        cap.setStrokeStyle(1, accentForTimeline(this.timeline), 0.55);
        cap.setDepth(this.depth + 0.01);
        this.root.add(cap);
      }
    }

    const topStrip = this.scene.add.rectangle(
      this.rect.x,
      topY + TOP_STRIP_HEIGHT / 2,
      Math.max(8, this.rect.width - 4),
      TOP_STRIP_HEIGHT,
      accentForTimeline(this.timeline),
      0.76,
    );
    topStrip.setDepth(this.depth + 0.04);
    this.root.add(topStrip);
    this.accentBars.push(topStrip);

    if (this.family === 'reactor-heavy' || this.family === 'reactor-machine') {
      const lowerStrip = this.scene.add.rectangle(
        this.rect.x,
        topY + visualHeight - 5,
        Math.max(8, this.rect.width - 18),
        3,
        accentForTimeline(this.timeline),
        0.24,
      );
      lowerStrip.setDepth(this.depth + 0.04);
      this.root.add(lowerStrip);
      this.accentBars.push(lowerStrip);
    }
  }

  private drawSupports(): void {
    this.supportGraphics.clear();

    const color = supportColorForTimeline(this.timeline);
    const alpha = this.timeline === 'future' ? 0.62 : 0.76;
    const topY = this.rect.y - this.rect.height / 2;
    const visualHeight = platformFaceHeight(this.family, this.rect.height);
    const supportTop = topY + Math.max(18, visualHeight - 7);

    this.supportGraphics.lineStyle(this.family === 'reactor-heavy' ? 7 : 4, color, alpha);

    if (this.family === 'reactor-catwalk' || this.family === 'reactor-gantry') {
      const spacing = this.family === 'reactor-gantry' ? 150 : 110;
      const supportDepth = this.family === 'reactor-gantry' ? 54 : 38;
      const left = this.rect.x - this.rect.width / 2 + 20;
      const right = this.rect.x + this.rect.width / 2 - 20;

      for (let x = left; x < right; x += spacing) {
        const next = Math.min(x + spacing * 0.72, right);
        this.supportGraphics.lineBetween(x, supportTop, next, supportTop + supportDepth);
        this.supportGraphics.lineBetween(next, supportTop, x, supportTop + supportDepth);
      }

      if (this.family === 'reactor-gantry') {
        this.supportGraphics.lineStyle(3, color, alpha * 0.86);
        this.supportGraphics.lineBetween(left, supportTop - 80, left + 16, supportTop);
        this.supportGraphics.lineBetween(right, supportTop - 80, right - 16, supportTop);
      }
      return;
    }

    const spacing = this.family === 'reactor-machine' ? 190 : 150;
    const supportDepth = this.family === 'reactor-machine' ? 72 : 58;
    const left = this.rect.x - this.rect.width / 2 + 34;
    const right = this.rect.x + this.rect.width / 2 - 34;

    for (let x = left; x <= right; x += spacing) {
      this.supportGraphics.lineBetween(x, supportTop, x, supportTop + supportDepth);
      this.supportGraphics.lineBetween(x - 24, supportTop + supportDepth, x, supportTop + 10);
      this.supportGraphics.lineBetween(x + 24, supportTop + supportDepth, x, supportTop + 10);
    }
  }
}

const inferFamily = (rect: RectSpec): PlatformVisualFamily => {
  if (rect.height <= 26) return 'reactor-catwalk';
  if (rect.height >= 72) return 'reactor-machine';
  return 'reactor-heavy';
};

const platformFaceHeight = (family: PlatformVisualFamily, sourceHeight: number): number => {
  if (family === 'reactor-catwalk') return Math.max(24, Math.min(34, sourceHeight + 10));
  if (family === 'reactor-gantry') return Math.max(30, Math.min(40, sourceHeight + 12));
  if (family === 'reactor-machine') return Math.max(54, Math.min(82, sourceHeight));
  return Math.max(42, Math.min(62, sourceHeight));
};
