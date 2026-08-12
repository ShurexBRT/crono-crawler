import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { LevelData, TimelineKey } from '../types';

const palette: Record<TimelineKey, { accent: number; structure: number; dark: number; haze: number; matteTint: number }> = {
  past: {
    accent: 0xe0a443,
    structure: 0x73502a,
    dark: 0x17100a,
    haze: 0x7a431d,
    matteTint: 0xf1c783,
  },
  present: {
    accent: 0x48cee8,
    structure: 0x193946,
    dark: 0x070c12,
    haze: 0x123848,
    matteTint: 0xffffff,
  },
  future: {
    accent: 0xe05a8a,
    structure: 0x4a1c2d,
    dark: 0x10060b,
    haze: 0x52162f,
    matteTint: 0xc87592,
  },
};

/**
 * Lightweight layered presentation renderer for The Folded Reactor.
 * It deliberately owns no collision. Final authored raster layers can replace
 * the drawing internals without changing GameScene / level geometry.
 */
export class ReactorEnvironmentRenderer {
  private readonly scene: Phaser.Scene;
  private readonly level: LevelData;
  private readonly reducedMotion: boolean;
  private readonly matte?: Phaser.GameObjects.Image;
  private readonly far: Phaser.GameObjects.Container;
  private readonly mid: Phaser.GameObjects.Container;
  private readonly foreground: Phaser.GameObjects.Container;
  private readonly farGraphics: Phaser.GameObjects.Graphics;
  private readonly midGraphics: Phaser.GameObjects.Graphics;
  private readonly foregroundGraphics: Phaser.GameObjects.Graphics;
  private readonly wash: Phaser.GameObjects.Rectangle;
  private readonly atmosphere: Phaser.GameObjects.GameObject[] = [];
  private timeline: TimelineKey;

  constructor(scene: Phaser.Scene, level: LevelData, timeline: TimelineKey, reducedMotion = false) {
    this.scene = scene;
    this.level = level;
    this.timeline = timeline;
    this.reducedMotion = reducedMotion;

    this.far = scene.add.container(0, 0).setDepth(-27).setScrollFactor(0.1, 0.025);
    this.mid = scene.add.container(0, 0).setDepth(-17).setScrollFactor(0.32, 0.06);
    this.foreground = scene.add.container(0, 0).setDepth(15.4).setScrollFactor(1.075, 0.12);

    this.farGraphics = scene.add.graphics();
    this.midGraphics = scene.add.graphics();
    this.foregroundGraphics = scene.add.graphics();
    this.far.add(this.farGraphics);
    this.mid.add(this.midGraphics);
    this.foreground.add(this.foregroundGraphics);

    if (scene.textures.exists(TextureKeys.backdropReactor)) {
      this.matte = scene.add
        .image(level.width / 2, 360, TextureKeys.backdropReactor)
        .setDepth(-30)
        .setScrollFactor(0.14, 0.035)
        .setDisplaySize(Math.max(level.width + 900, 2200), 780)
        .setAlpha(0.91);
    }

    this.wash = scene.add
      .rectangle(level.width / 2, 360, level.width + 900, 780, palette[timeline].haze, 0.1)
      .setDepth(-29)
      .setScrollFactor(0.14, 0.035)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.createAtmosphere();
    this.setTimeline(timeline, false);
  }

  setTimeline(timeline: TimelineKey, animate = true): void {
    this.timeline = timeline;
    const colors = palette[timeline];
    this.redrawFar(colors, timeline);
    this.redrawMid(colors, timeline);
    this.redrawForeground(colors, timeline);

    this.wash.setFillStyle(colors.haze, timeline === 'present' ? 0.07 : 0.13);
    this.matte?.setTint(colors.matteTint);

    if (animate && !this.reducedMotion && this.matte) {
      this.matte.setAlpha(0.74);
      this.scene.tweens.add({
        targets: this.matte,
        alpha: 0.91,
        duration: 220,
        ease: 'Quad.easeOut',
      });
    }
  }

  destroy(): void {
    this.atmosphere.forEach((object) => object.destroy());
    this.matte?.destroy();
    this.wash.destroy();
    this.far.destroy(true);
    this.mid.destroy(true);
    this.foreground.destroy(true);
  }

  private redrawFar(colors: (typeof palette)[TimelineKey], timeline: TimelineKey): void {
    const g = this.farGraphics;
    g.clear();

    g.fillStyle(colors.dark, 0.88);
    // Monumental stepped reactor towers.
    [120, 420, 1450, 1710].forEach((x, index) => {
      const height = 300 + (index % 2) * 90;
      g.fillRect(x, 660 - height, 150, height);
      g.fillTriangle(x + 18, 660 - height, x + 75, 660 - height - 62, x + 132, 660 - height);
      g.fillRect(x + 42, 660 - height - 92, 66, 32);
    });

    // Reactor ring as distant architectural silhouette, not a UI glyph.
    const ringX = 1010;
    const ringY = 350;
    g.lineStyle(22, colors.structure, timeline === 'present' ? 0.34 : 0.42);
    g.strokeCircle(ringX, ringY, 230);
    g.lineStyle(8, colors.accent, 0.16);
    g.strokeCircle(ringX, ringY, 180);

    g.lineStyle(4, colors.structure, 0.42);
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      g.lineBetween(
        ringX + Math.cos(angle) * 165,
        ringY + Math.sin(angle) * 165,
        ringX + Math.cos(angle) * 225,
        ringY + Math.sin(angle) * 225,
      );
    }

    // High deco ribs frame the shaft.
    g.lineStyle(10, colors.structure, 0.5);
    [260, 650, 1370, 1740].forEach((x) => {
      g.lineBetween(x, 620, x, 110);
      g.lineBetween(x, 110, x + 74, 62);
    });

    if (timeline === 'future') {
      g.lineStyle(5, colors.accent, 0.36);
      g.beginPath();
      g.moveTo(1115, 82);
      g.lineTo(1065, 196);
      g.lineTo(1110, 258);
      g.lineTo(1040, 390);
      g.lineTo(1084, 462);
      g.lineTo(1010, 610);
      g.strokePath();
    }
  }

  private redrawMid(colors: (typeof palette)[TimelineKey], timeline: TimelineKey): void {
    const g = this.midGraphics;
    g.clear();

    // Service towers and pipe stacks.
    g.fillStyle(colors.dark, 0.72);
    [230, 700, 1240, 1630].forEach((x, index) => {
      const towerWidth = index % 2 ? 118 : 92;
      const towerHeight = 210 + (index % 2) * 70;
      g.fillRect(x, 650 - towerHeight, towerWidth, towerHeight);
      g.lineStyle(4, colors.structure, 0.76);
      g.strokeRect(x + 8, 650 - towerHeight + 12, towerWidth - 16, towerHeight - 24);
      for (let y = 650 - towerHeight + 42; y < 620; y += 54) {
        g.lineBetween(x + 8, y, x + towerWidth - 8, y);
      }
    });

    // Catwalk silhouettes and triangular industrial bracing.
    g.lineStyle(6, colors.structure, 0.72);
    const spans = [
      [120, 430, 560],
      [520, 860, 470],
      [1120, 1460, 520],
      [1460, 1810, 430],
    ] as const;
    spans.forEach(([left, right, y]) => {
      g.lineBetween(left, y, right, y);
      for (let x = left; x < right; x += 92) {
        g.lineBetween(x, y, Math.min(x + 46, right), y + 45);
        g.lineBetween(Math.min(x + 46, right), y + 45, Math.min(x + 92, right), y);
      }
    });

    // Pipe runs.
    g.lineStyle(12, colors.structure, 0.45);
    g.lineBetween(0, 250, 520, 250);
    g.lineBetween(520, 250, 520, 335);
    g.lineBetween(1370, 285, this.level.width + 120, 285);
    g.lineBetween(1370, 285, 1370, 360);

    // Timeline state changes silhouette, not only color.
    if (timeline === 'past') {
      g.lineStyle(4, colors.accent, 0.32);
      g.strokeRoundedRect(820, 170, 390, 230, 34);
      g.strokeRoundedRect(850, 195, 330, 180, 28);
    } else if (timeline === 'future') {
      g.lineStyle(8, colors.structure, 0.62);
      g.lineBetween(820, 205, 930, 330);
      g.lineBetween(1170, 205, 1060, 330);
      g.lineStyle(4, colors.accent, 0.3);
      g.lineBetween(930, 330, 980, 390);
      g.lineBetween(1060, 330, 1000, 420);
    }
  }

  private redrawForeground(colors: (typeof palette)[TimelineKey], timeline: TimelineKey): void {
    const g = this.foregroundGraphics;
    g.clear();

    g.lineStyle(20, 0x020305, timeline === 'future' ? 0.9 : 0.84);
    g.lineBetween(18, 0, 18, 720);
    g.lineBetween(this.level.width - 18, 0, this.level.width - 18, 720);

    // Hanging pipes / chains create near-camera framing.
    [180, 520, 970, 1510].forEach((x, index) => {
      g.lineStyle(index % 2 ? 8 : 12, 0x020305, 0.78);
      g.lineBetween(x, 0, x + (index % 2 ? 28 : -18), 130 + index * 22);
      g.lineStyle(2, colors.accent, 0.14);
      g.lineBetween(x + 5, 0, x + (index % 2 ? 33 : -13), 130 + index * 22);
    });

    g.fillStyle(0x020305, 0.84);
    g.fillRect(-30, 585, 150, 165);
    g.fillRect(this.level.width - 120, 565, 170, 185);

    if (timeline === 'future') {
      g.lineStyle(5, colors.accent, 0.17);
      g.lineBetween(80, 560, 170, 480);
      g.lineBetween(this.level.width - 85, 540, this.level.width - 185, 455);
    }
  }

  private createAtmosphere(): void {
    const vents = [
      { x: 255, y: 606, width: 130, alpha: 0.075 },
      { x: 690, y: 592, width: 150, alpha: 0.065 },
      { x: 1220, y: 604, width: 125, alpha: 0.07 },
      { x: 1650, y: 586, width: 160, alpha: 0.06 },
    ];

    vents.forEach((vent, index) => {
      const mist = this.scene.add
        .ellipse(vent.x, vent.y, vent.width, 30, 0xb7d1d6, vent.alpha)
        .setDepth(-3.5)
        .setScrollFactor(0.84)
        .setBlendMode(Phaser.BlendModes.SCREEN);
      this.atmosphere.push(mist);

      if (this.reducedMotion) return;
      this.scene.tweens.add({
        targets: mist,
        x: vent.x + 30 + index * 6,
        y: vent.y - 28,
        scaleX: 1.35,
        scaleY: 1.6,
        alpha: 0,
        duration: 2300 + index * 260,
        repeat: -1,
        delay: index * 360,
        ease: 'Sine.easeOut',
        onRepeat: () => mist.setPosition(vent.x, vent.y).setScale(1).setAlpha(vent.alpha),
      });
    });
  }
}
