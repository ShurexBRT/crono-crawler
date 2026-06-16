import Phaser from 'phaser';
import type {
  CheckpointSpec,
  DoorSpec,
  PlatformSpec,
  PressurePlateSpec,
  SwitchSpec,
  TimelineBlockSpec,
  TimelineKey,
} from '../types';

type Actor = Phaser.Physics.Arcade.Sprite | undefined;

export class StaticPlatform {
  readonly rectangle: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, spec: PlatformSpec, group: Phaser.Physics.Arcade.StaticGroup) {
    this.rectangle = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, spec.color ?? 0x222a31);
    this.rectangle.setStrokeStyle(1, 0x44525f, 0.8);
    this.rectangle.setDepth(8);
    scene.physics.add.existing(this.rectangle, true);
    group.add(this.rectangle);
  }
}

export class TimelineBlock {
  readonly id: string;
  readonly rectangle: Phaser.GameObjects.Rectangle;
  private spec: TimelineBlockSpec;

  constructor(scene: Phaser.Scene, spec: TimelineBlockSpec, group: Phaser.Physics.Arcade.StaticGroup) {
    this.id = spec.id;
    this.spec = spec;
    this.rectangle = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, spec.states.present.color);
    this.rectangle.setDepth(9);
    this.rectangle.setStrokeStyle(1, 0x6c7f86, 0.8);
    scene.physics.add.existing(this.rectangle, true);
    group.add(this.rectangle);
  }

  applyTimeline(timeline: TimelineKey): void {
    const state = this.spec.states[timeline];
    const body = this.rectangle.body as Phaser.Physics.Arcade.StaticBody;
    this.rectangle.setVisible(state.visible);
    this.rectangle.setAlpha(state.alpha ?? 1);
    this.rectangle.setFillStyle(state.color);
    body.enable = state.solid;
    body.checkCollision.none = !state.solid;
    body.updateFromGameObject();
  }
}

export class TimelineDoor {
  readonly id: string;
  readonly rectangle: Phaser.GameObjects.Rectangle;
  private spec: DoorSpec;
  private wasOpen = false;

  constructor(scene: Phaser.Scene, spec: DoorSpec, group: Phaser.Physics.Arcade.StaticGroup) {
    this.id = spec.id;
    this.spec = spec;
    this.rectangle = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, spec.states.present.color);
    this.rectangle.setDepth(12);
    this.rectangle.setStrokeStyle(2, 0x1b2028, 0.95);
    scene.physics.add.existing(this.rectangle, true);
    group.add(this.rectangle);
  }

  apply(timeline: TimelineKey, flags: Set<string>): boolean {
    const state = this.spec.states[timeline];
    const isUnlocked = this.spec.requiresFlags.every((flag) => flags.has(flag));
    const solid = state.solid && !isUnlocked;
    const body = this.rectangle.body as Phaser.Physics.Arcade.StaticBody;

    this.rectangle.setVisible(state.visible);
    this.rectangle.setAlpha(isUnlocked ? 0.18 : state.alpha ?? 1);
    this.rectangle.setFillStyle(isUnlocked ? 0x73f2b2 : state.color);
    body.enable = solid;
    body.checkCollision.none = !solid;
    body.updateFromGameObject();

    const openedNow = isUnlocked && !this.wasOpen;
    this.wasOpen = isUnlocked;
    return openedNow;
  }
}

export class PressurePlate {
  readonly id: string;
  readonly flag: string;
  readonly rectangle: Phaser.GameObjects.Rectangle;
  private spec: PressurePlateSpec;
  private active = false;

  constructor(scene: Phaser.Scene, spec: PressurePlateSpec) {
    this.id = spec.id;
    this.flag = spec.flag;
    this.spec = spec;
    this.rectangle = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, 0x4a3648);
    this.rectangle.setDepth(11);
    this.rectangle.setStrokeStyle(1, 0xc46cff, 0.65);
    scene.physics.add.existing(this.rectangle, true);
  }

  update(timeline: TimelineKey, actors: Actor[]): boolean {
    const available = !this.spec.timelines || this.spec.timelines.includes(timeline);
    const occupied = available && actors.some((actor) => actor && boundsOverlap(this.rectangle, actor));
    this.active = occupied;
    this.rectangle.setAlpha(available ? 1 : 0.22);
    this.rectangle.setFillStyle(occupied ? 0xdbb3ff : 0x4a3648);
    return occupied;
  }
}

export class LeverSwitch {
  readonly id: string;
  readonly flag: string;
  readonly rectangle: Phaser.GameObjects.Rectangle;
  private spec: SwitchSpec;
  private toggled = false;

  constructor(scene: Phaser.Scene, spec: SwitchSpec) {
    this.id = spec.id;
    this.flag = spec.flag;
    this.spec = spec;
    this.rectangle = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, 0x67452c);
    this.rectangle.setDepth(11);
    this.rectangle.setStrokeStyle(1, 0xefb14d, 0.8);
    scene.physics.add.existing(this.rectangle, true);
  }

  update(timeline: TimelineKey, actor: Actor, interact: boolean, ghost: Actor, ghostInteract: boolean): boolean {
    const available = !this.spec.timelines || this.spec.timelines.includes(timeline);
    const playerUses = available && interact && actor && boundsOverlap(this.rectangle, actor, 24, 28);
    const ghostUses = available && ghostInteract && ghost && boundsOverlap(this.rectangle, ghost, 24, 28);

    this.rectangle.setAlpha(available ? 1 : 0.28);
    if (!this.toggled && (playerUses || ghostUses)) {
      this.toggled = true;
      this.rectangle.setFillStyle(0xe6c36a);
      return true;
    }

    this.rectangle.setFillStyle(this.toggled ? 0xe6c36a : 0x67452c);
    return false;
  }

  reset(): void {
    this.toggled = false;
  }

  get isToggled(): boolean {
    return this.toggled;
  }
}

export class CheckpointBeacon {
  readonly id: string;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private active = false;

  constructor(scene: Phaser.Scene, spec: CheckpointSpec, texture: string) {
    this.id = spec.id;
    this.sprite = scene.physics.add.staticSprite(spec.x, spec.y, texture);
    this.sprite.setDepth(10);
    this.sprite.setAlpha(0.65);
  }

  update(actor: Actor): boolean {
    if (!actor || this.active || !boundsOverlap(this.sprite, actor, 20, 28)) {
      return false;
    }
    this.active = true;
    this.sprite.setAlpha(1);
    this.sprite.setTint(0x8ed081);
    return true;
  }
}

function boundsOverlap(
  a: Phaser.GameObjects.GameObject & { getBounds: () => Phaser.Geom.Rectangle },
  b: Phaser.GameObjects.GameObject & { getBounds: () => Phaser.Geom.Rectangle },
  inflateX = 0,
  inflateY = 0,
): boolean {
  const boundsA = a.getBounds();
  const boundsB = b.getBounds();
  boundsA.x -= inflateX;
  boundsA.y -= inflateY;
  boundsA.width += inflateX * 2;
  boundsA.height += inflateY * 2;
  return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
}
