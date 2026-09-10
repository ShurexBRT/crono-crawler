import Phaser from 'phaser';
import { getBackdrop, type BackdropSpec } from '../../assets/backdrops';
import type { LevelData, TimelineKey } from '../../types';
import { backdropExtent, coverScale, VIEW_HEIGHT, VIEW_WIDTH } from './backdropLayout';

export function preloadBackdrop(scene: Phaser.Scene, levelId: string): void {
  const spec = getBackdrop(levelId);
  if (!scene.textures.exists(spec.key)) scene.load.image(spec.key, spec.path);
}

/** Owns only scenery. Collision and timeline puzzle state remain in the level systems. */
export class ParallaxBackdrop {
  private readonly matte: Phaser.GameObjects.Image;
  private readonly weather: Phaser.GameObjects.Graphics;
  private readonly pastDetails: Phaser.GameObjects.Graphics;
  private readonly futureDetails: Phaser.GameObjects.Graphics;
  private readonly spec: BackdropSpec;
  private timeline: TimelineKey;
  private elapsed = 0;

  constructor(private readonly scene: Phaser.Scene, level: LevelData, timeline: TimelineKey) {
    this.spec = getBackdrop(level.id);
    this.timeline = timeline;
    const far = backdropExtent(level.width, level.height, 0.12, 0.1);
    this.matte = scene.add.image(0, 0, this.spec.key).setOrigin(0).setDepth(-32).setScrollFactor(0.12, 0.1);
    this.matte.setScale(coverScale(this.matte.width, this.matte.height, far.width, far.height));
    this.matte.setName('campaign-far-backdrop');

    const middle = backdropExtent(level.width, level.height, 0.38, 0.28);
    const ribs = scene.add.graphics().setDepth(-20).setScrollFactor(0.38, 0.28).setName('campaign-midground');
    this.pastDetails = scene.add.graphics().setDepth(-19).setScrollFactor(0.38, 0.28);
    this.futureDetails = scene.add.graphics().setDepth(-18).setScrollFactor(0.38, 0.28);
    this.drawArchitecture(ribs, middle.width, middle.height);

    // Near-camera framing stays in the ceiling band, away from landing edges and devices.
    const near = scene.add.graphics().setDepth(23).setScrollFactor(1.08, 0).setName('campaign-foreground');
    near.fillStyle(0x090d10, 0.82).fillRect(0, 0, level.width * 1.08 + VIEW_WIDTH, 14);
    for (let x = 60; x < level.width * 1.08 + VIEW_WIDTH; x += 610) {
      near.lineStyle(4, 0x101819, 0.75).lineBetween(x, 0, x + 18, 68);
      near.lineStyle(1, 0x69706b, 0.6).lineBetween(x + 5, 0, x + 23, 63);
    }
    this.weather = scene.add.graphics().setDepth(3).setScrollFactor(0).setName('campaign-weather');
    this.setTimeline(timeline);
    this.drawWeather();
  }

  setTimeline(timeline: TimelineKey): void {
    this.timeline = timeline;
    this.matte.setTint({ past: 0xffedcf, present: 0xffffff, future: 0xcbb5bd }[timeline]);
    this.pastDetails.setVisible(timeline === 'past');
    this.futureDetails.setVisible(timeline === 'future');
    this.drawWeather();
  }

  update(delta: number, reducedMotion: boolean): void {
    if (reducedMotion || this.timeline === 'present') return;
    this.elapsed += Math.min(delta, 50);
    this.drawWeather();
  }

  private drawArchitecture(g: Phaser.GameObjects.Graphics, width: number, height: number): void {
    const exterior = ['city', 'canal', 'aerial'].includes(this.spec.motif);
    const spacing = exterior ? 560 : 460;
    for (let x = 210; x < width + spacing; x += spacing) {
      const end = exterior ? 190 : height;
      g.fillStyle(0x121d1d, exterior ? 0.6 : 0.38).fillRect(x, 0, exterior ? 7 : 18, end);
      g.lineStyle(1, this.spec.accent, 0.28).lineBetween(x + 19, 0, x + 19, end);
      g.lineStyle(3, 0x192123, 0.45).lineBetween(x, 86, x + spacing, 126);
      this.pastDetails.lineStyle(2, this.spec.accent, 0.44).lineBetween(x, 90, x + spacing, 130);
      this.futureDetails.lineStyle(2, 0x301c24, 0.7).lineBetween(x, 86, x + spacing * 0.28, 190);
      this.futureDetails.lineBetween(x + spacing, 126, x + spacing * 0.8, 170);

      if (this.spec.motif === 'glass' || this.spec.motif === 'canal') {
        for (let leaf = 0; leaf < 6; leaf += 1) {
          g.fillStyle(leaf % 2 ? 0x344c35 : 0x1a352d, 0.55);
          g.fillEllipse(x + (leaf % 2 ? -12 : 20), 100 + leaf * 16, 27, 9);
        }
      } else if (this.spec.motif === 'hotel' || this.spec.motif === 'arcade') {
        g.fillStyle(0x4f2934, 0.6).fillTriangle(x + 26, 20, x + 108, 20, x + 67, 154);
        g.lineStyle(1, this.spec.accent, 0.4).strokeTriangle(x + 30, 24, x + 104, 24, x + 67, 147);
      } else if (this.spec.motif === 'conduit') {
        g.lineStyle(7, 0x242e2e, 0.6).lineBetween(x + 40, 0, x + 40, 240);
        for (let band = 35; band < 230; band += 65) g.fillStyle(0x766859, 0.5).fillRect(x + 32, band, 17, 5);
      }
      g.fillStyle(0x242327, 0.8).fillRect(x - 6, 146, 27, 42);
      this.pastDetails.fillStyle(0xf3c183, 0.76).fillRect(x - 1, 154, 17, 25);
      g.fillStyle(this.spec.accent, 0.35).fillRect(x + 3, 155, 5, 23);
    }
  }

  private drawWeather(): void {
    this.weather.clear();
    const isRain = this.spec.weather === 'rain' && this.timeline !== 'future';
    const count = isRain ? 70 : 26;
    const speed = this.timeline === 'future' ? -0.013 : isRain ? 0.26 : -0.01;
    this.weather.lineStyle(1, 0xd4e2df, 0.17);
    this.weather.fillStyle(this.timeline === 'future' ? 0xd6bab8 : 0xedd8b5, 0.28);
    for (let i = 0; i < count; i += 1) {
      const x = ((i * 193 + this.elapsed * 0.012) % (VIEW_WIDTH + 40)) - 20;
      const y = ((i * 97 + this.elapsed * speed) % VIEW_HEIGHT + VIEW_HEIGHT) % VIEW_HEIGHT;
      if (isRain) this.weather.lineBetween(x, y, x - 5, y + 18);
      else this.weather.fillRect(x, y, 2, 2);
    }
  }
}
