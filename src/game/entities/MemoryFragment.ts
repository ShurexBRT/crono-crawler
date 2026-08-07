import Phaser from 'phaser';
import type { MemoryFragmentSpec } from '../types';

export class MemoryFragment {
  readonly id: string;
  private collected: boolean;
  private glow: Phaser.GameObjects.Arc;
  private core: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, private readonly spec: MemoryFragmentSpec, collected = false) {
    this.id = spec.id;
    this.collected = collected;
    this.glow = scene.add.circle(spec.x, spec.y, 20, 0xf0a64d, collected ? 0.04 : 0.12);
    this.glow.setStrokeStyle(2, 0x6ee7f2, collected ? 0.12 : 0.34);
    this.glow.setDepth(10.5);

    this.core = scene.add.circle(spec.x, spec.y, 7, collected ? 0x6ee7f2 : 0xf0a64d, collected ? 0.16 : 0.72);
    this.core.setStrokeStyle(1, 0xf2ead4, collected ? 0.18 : 0.72);
    this.core.setDepth(10.6);
  }

  update(actor: Phaser.GameObjects.GameObject & { getBounds: () => Phaser.Geom.Rectangle }): MemoryFragmentSpec | undefined {
    if (this.collected || !overlaps(actor, this.bounds())) {
      return undefined;
    }

    this.collected = true;
    this.glow.setAlpha(0.04);
    this.core.setAlpha(0.22);
    this.core.setFillStyle(0x6ee7f2, 0.28);
    return this.spec;
  }

  private bounds(): Phaser.Geom.Rectangle {
    const width = this.spec.width ?? 72;
    const height = this.spec.height ?? 92;
    return new Phaser.Geom.Rectangle(this.spec.x - width / 2, this.spec.y - height / 2, width, height);
  }
}

function overlaps(actor: Phaser.GameObjects.GameObject & { getBounds: () => Phaser.Geom.Rectangle }, target: Phaser.Geom.Rectangle): boolean {
  return Phaser.Geom.Intersects.RectangleToRectangle(actor.getBounds(), target);
}
