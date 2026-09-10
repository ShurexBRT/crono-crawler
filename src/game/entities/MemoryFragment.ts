import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import type { MemoryFragmentSpec } from '../types';

export class MemoryFragment {
  readonly id: string;
  private collected: boolean;
  private visual: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, private readonly spec: MemoryFragmentSpec, collected = false) {
    this.id = spec.id;
    this.collected = collected;
    this.visual = scene.add.image(spec.x, spec.y, TextureKeys.productionMemoryFragment)
      .setDisplaySize(32, 40).setDepth(11.4).setAlpha(collected ? 0.12 : 1);
  }

  update(actor: Phaser.GameObjects.GameObject & { getBounds: () => Phaser.Geom.Rectangle }): MemoryFragmentSpec | undefined {
    if (this.collected || !overlaps(actor, this.bounds())) {
      return undefined;
    }

    this.collected = true;
    this.visual.setAlpha(0.12).setTint(0x6ee7f2);
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
