import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { PlatformVisualFamily, RectSpec, TimelineKey } from '../types';

const MODULE_WIDTH = 128;
const TOP_STRIP_HEIGHT = 4;

type RectWithId = RectSpec & { id?: string };

const moduleTextureKeys: Record<PlatformVisualFamily, Record<TimelineKey, string>> = {
  'reactor-heavy': {
    past: TextureKeys.reactorHeavyPast,
    present: TextureKeys.reactorHeavyPresent,
    future: TextureKeys.reactorHeavyFuture,
  },
  'reactor-catwalk': {
    past: TextureKeys.reactorCatwalkPast,
    present: TextureKeys.reactorCatwalkPresent,
    future: TextureKeys.reactorCatwalkFuture,
  },
  'reactor-gantry': {
    past: TextureKeys.reactorGantryPast,
    present: TextureKeys.reactorGantryPresent,
    future: TextureKeys.reactorGantryFuture,
  },
  'reactor-machine': {
    past: TextureKeys.reactorMachinePast,
    present: TextureKeys.reactorMachinePresent,
    future: TextureKeys.reactorMachineFuture,
  },
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
  private readonly rect: RectWithId;
  private readonly family: PlatformVisualFamily;
  private readonly depth: number;
  private readonly root: Phaser.GameObjects.Container;
  private readonly moduleImages: Phaser.GameObjects.Image[] = [];
  private readonly accentBars: Phaser.GameObjects.Rectangle[] = [];
  private readonly supportGraphics: Phaser.GameObjects.Graphics;
  private timeline: TimelineKey;

  constructor(scene: Phaser.Scene, rect: RectWithId, options: PlatformVisualOptions = {}) {
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
    const texture = moduleTextureKeys[this.family][timeline];
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
      bar.setFillStyle(accent, timeline === 'future' ? 0.58 : 0.72);
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

      const texture = moduleTextureKeys[this.family][this.timeline];
      const image = this.scene.add.image(centerX, topY, texture);
      image.setOrigin(0.5, 0);
      image.setDisplaySize(width + 1, visualHeight);
      image.setDepth(this.depth);
      this.root.add(image);
      this.moduleImages.push(image);

      if (index === 0 || index === moduleCount - 1) {
        const capWidth = Math.min(7, Math.max(4, width * 0.07));
        const capX = index === 0 ? moduleLeft + capWidth / 2 : moduleLeft + width - capWidth / 2;
        const cap = this.scene.add.rectangle(capX, topY + visualHeight * 0.46, capWidth, visualHeight * 0.78, 0x05070a, 0.68);
        cap.setStrokeStyle(1, accentForTimeline(this.timeline), 0.42);
        cap.setDepth(this.depth + 0.01);
        this.root.add(cap);
      }
    }

    // Thin gameplay edge line keeps the true collision top readable even on busy art.
    const topStrip = this.scene.add.rectangle(
      this.rect.x,
      topY + TOP_STRIP_HEIGHT / 2,
      Math.max(8, this.rect.width - 4),
      TOP_STRIP_HEIGHT,
      accentForTimeline(this.timeline),
      0.7,
    );
    topStrip.setDepth(this.depth + 0.04);
    this.root.add(topStrip);
    this.accentBars.push(topStrip);
  }

  private drawSupports(): void {
    this.supportGraphics.clear();

    const color = supportColorForTimeline(this.timeline);
    const alpha = this.timeline === 'future' ? 0.54 : 0.7;
    const topY = this.rect.y - this.rect.height / 2;
    const visualHeight = platformFaceHeight(this.family, this.rect.height);
    const supportTop = topY + Math.max(20, visualHeight - 9);

    if (this.family === 'reactor-catwalk' || this.family === 'reactor-gantry') {
      const spacing = this.family === 'reactor-gantry' ? 160 : 118;
      const supportDepth = this.family === 'reactor-gantry' ? 55 : 38;
      const left = this.rect.x - this.rect.width / 2 + 18;
      const right = this.rect.x + this.rect.width / 2 - 18;

      this.supportGraphics.lineStyle(this.family === 'reactor-gantry' ? 5 : 4, color, alpha);
      for (let x = left; x < right; x += spacing) {
        const next = Math.min(x + spacing * 0.76, right);
        this.supportGraphics.lineBetween(x, supportTop, next, supportTop + supportDepth);
        this.supportGraphics.lineBetween(next, supportTop, x, supportTop + supportDepth);
      }

      if (this.family === 'reactor-gantry') {
        this.supportGraphics.lineStyle(3, color, alpha * 0.82);
        this.supportGraphics.lineBetween(left, supportTop - 72, left + 14, supportTop);
        this.supportGraphics.lineBetween(right, supportTop - 72, right - 14, supportTop);
      }
      return;
    }

    const spacing = this.family === 'reactor-machine' ? 200 : 158;
    const supportDepth = this.family === 'reactor-machine' ? 68 : 54;
    const left = this.rect.x - this.rect.width / 2 + 34;
    const right = this.rect.x + this.rect.width / 2 - 34;

    this.supportGraphics.lineStyle(this.family === 'reactor-machine' ? 8 : 6, color, alpha);
    for (let x = left; x <= right; x += spacing) {
      this.supportGraphics.lineBetween(x, supportTop, x, supportTop + supportDepth);
      this.supportGraphics.lineBetween(x - 25, supportTop + supportDepth, x, supportTop + 9);
      this.supportGraphics.lineBetween(x + 25, supportTop + supportDepth, x, supportTop + 9);
    }
  }
}

const inferFamily = (rect: RectWithId): PlatformVisualFamily => {
  const id = rect.id?.toLowerCase() ?? '';
  if (id.includes('bridge') || id.includes('span')) return 'reactor-gantry';
  if (id.includes('step') || id.includes('catwalk')) return 'reactor-catwalk';
  if (id.includes('machine') || id.includes('housing')) return 'reactor-machine';
  if (rect.height <= 26) return 'reactor-catwalk';
  if (rect.height >= 72) return 'reactor-machine';
  return 'reactor-heavy';
};

const platformFaceHeight = (family: PlatformVisualFamily, sourceHeight: number): number => {
  if (family === 'reactor-catwalk') return Math.max(30, Math.min(48, sourceHeight + 18));
  if (family === 'reactor-gantry') return Math.max(44, Math.min(64, sourceHeight + 30));
  if (family === 'reactor-machine') return Math.max(62, Math.min(92, sourceHeight + 18));
  return Math.max(54, Math.min(78, sourceHeight + 14));
};