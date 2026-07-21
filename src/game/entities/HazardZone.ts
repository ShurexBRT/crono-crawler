import Phaser from 'phaser';
import type { HazardSpec, TimelineKey } from '../types';

type OverlapTarget = Phaser.GameObjects.GameObject & {
  getBounds: () => Phaser.Geom.Rectangle;
};

export class HazardZone {
  readonly id: string;
  readonly message: string;
  private readonly spec: HazardSpec;
  private readonly body: Phaser.GameObjects.Rectangle;
  private readonly surface: Phaser.GameObjects.Rectangle;
  private active = true;

  constructor(scene: Phaser.Scene, spec: HazardSpec) {
    this.id = spec.id;
    this.spec = spec;
    this.message = spec.message ?? 'The canal folds Elias back to safer ground.';
    const color = spec.color ?? 0x0e4e5f;

    this.body = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, color, 0.42);
    this.body.setDepth(6.4);
    this.body.setStrokeStyle(1, 0x6ee7f2, 0.45);
    this.surface = scene.add.rectangle(spec.x, spec.y - spec.height / 2 + 4, Math.max(12, spec.width - 10), 3, 0x6ee7f2, 0.62);
    this.surface.setDepth(6.5);
  }

  applyTimeline(timeline: TimelineKey): void {
    this.active = !this.spec.timelines || this.spec.timelines.includes(timeline);
    this.body.setVisible(true);
    this.body.setAlpha(this.active ? 0.44 : 0.12);
    this.body.setFillStyle(this.spec.color ?? 0x0e4e5f, this.active ? 0.44 : 0.12);
    this.body.setStrokeStyle(1, this.active ? timelineAccent(timeline) : 0x3e4d56, this.active ? 0.58 : 0.22);
    this.surface.setAlpha(this.active ? 0.72 : 0.18);
    this.surface.setFillStyle(this.active ? timelineAccent(timeline) : 0x3e4d56, this.active ? 0.72 : 0.18);
  }

  overlaps(actor: OverlapTarget): boolean {
    return this.active && Phaser.Geom.Intersects.RectangleToRectangle(this.body.getBounds(), actor.getBounds());
  }
}

function timelineAccent(timeline: TimelineKey): number {
  if (timeline === 'past') {
    return 0xf0a64d;
  }
  if (timeline === 'future') {
    return 0xe0618a;
  }
  return 0x6ee7f2;
}
