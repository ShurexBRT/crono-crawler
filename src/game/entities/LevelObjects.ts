import Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
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
type TimelineActor = {
  sprite: Actor;
  timeline: TimelineKey;
};

export class StaticPlatform {
  readonly rectangle: Phaser.GameObjects.Rectangle;
  private visual?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, spec: PlatformSpec, group: Phaser.Physics.Arcade.StaticGroup) {
    this.rectangle = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, spec.color ?? 0x222a31);
    this.rectangle.setDepth(7.9);
    if (scene.textures.exists(TextureKeys.platformSheet) && scene.textures.get(TextureKeys.platformSheet).has('present')) {
      this.rectangle.setAlpha(0.01);
      this.visual = scene.add.image(spec.x, platformVisualY(spec), TextureKeys.platformSheet, 'present');
      this.visual.setOrigin(0.5, 0);
      this.visual.setDepth(8);
      this.visual.setDisplaySize(spec.width, platformVisualHeight(spec.height));
    } else {
      this.rectangle.setStrokeStyle(2, 0x0a0f14, 0.95);
      scene.add.rectangle(spec.x, spec.y - spec.height / 2 + 4, spec.width - 12, 3, 0xe0a04f, 0.22).setDepth(8.1);
      scene.add.rectangle(spec.x, spec.y + spec.height / 2 - 8, spec.width - 24, 2, 0x6ee7f2, 0.12).setDepth(8.1);
    }
    scene.physics.add.existing(this.rectangle, true);
    group.add(this.rectangle);
  }
}

export class TimelineBlock {
  readonly id: string;
  readonly rectangle: Phaser.GameObjects.Rectangle;
  private scene: Phaser.Scene;
  private spec: TimelineBlockSpec;
  private accent: Phaser.GameObjects.Rectangle;
  private ember: Phaser.GameObjects.Rectangle;
  private visual?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, spec: TimelineBlockSpec, group: Phaser.Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.id = spec.id;
    this.spec = spec;
    this.rectangle = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, spec.states.present.color);
    this.rectangle.setDepth(9);
    this.rectangle.setStrokeStyle(1, 0x6c7f86, 0.8);
    this.accent = scene.add.rectangle(spec.x, spec.y - spec.height / 2 + 4, Math.max(10, spec.width - 14), 3, 0x6ee7f2, 0.8);
    this.accent.setDepth(9.2);
    this.ember = scene.add.rectangle(spec.x, spec.y + spec.height / 2 - 4, Math.max(10, spec.width - 28), 2, 0xe0a04f, 0.28);
    this.ember.setDepth(9.1);

    if (scene.textures.exists(TextureKeys.platformSheet) && scene.textures.get(TextureKeys.platformSheet).has('present')) {
      this.visual = scene.add.image(spec.x, platformVisualY(spec), TextureKeys.platformSheet, 'present');
      this.visual.setOrigin(0.5, 0);
      this.visual.setDepth(9.15);
      this.visual.setAlpha(0.98);
      this.visual.setDisplaySize(spec.width, platformVisualHeight(spec.height));
    }

    scene.physics.add.existing(this.rectangle, true);
    group.add(this.rectangle);
  }

  applyTimeline(timeline: TimelineKey): void {
    const state = this.spec.states[timeline];
    const body = this.rectangle.body as Phaser.Physics.Arcade.StaticBody;
    const hasVisual = !!this.visual && this.scene.textures.get(TextureKeys.platformSheet).has(timeline);

    this.rectangle.setVisible(state.visible && !hasVisual);
    this.rectangle.setAlpha(hasVisual ? 0.01 : state.alpha ?? 1);
    this.rectangle.setFillStyle(state.color);
    this.rectangle.setStrokeStyle(state.solid ? 2 : 1, timelineAccent(timeline), state.solid ? 0.85 : 0.45);

    if (this.visual) {
      this.visual.setVisible(state.visible);
      this.visual.setAlpha(state.visible ? state.alpha ?? 1 : 0);
      if (hasVisual) {
        this.visual.setTexture(TextureKeys.platformSheet, timeline);
        this.visual.setPosition(this.spec.x, platformVisualY(this.spec));
        this.visual.setDisplaySize(this.spec.width, platformVisualHeight(this.spec.height));
      }
      this.visual.setTint(state.solid ? 0xffffff : timelineAccent(timeline));
    }

    this.accent.setVisible(state.visible && !hasVisual);
    this.accent.setAlpha(state.solid ? 0.82 : 0.28);
    this.accent.setFillStyle(timelineAccent(timeline), state.solid ? 0.82 : 0.28);
    this.ember.setVisible(state.visible && !hasVisual);
    this.ember.setAlpha(timeline === 'past' ? 0.48 : 0.18);
    this.ember.setFillStyle(timeline === 'past' ? 0xf0a64d : 0x101820, timeline === 'past' ? 0.48 : 0.18);
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
  private lockLine: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, spec: DoorSpec, group: Phaser.Physics.Arcade.StaticGroup) {
    this.id = spec.id;
    this.spec = spec;
    this.rectangle = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, spec.states.present.color);
    this.rectangle.setDepth(12);
    this.rectangle.setStrokeStyle(2, 0x1b2028, 0.95);
    this.lockLine = scene.add.rectangle(spec.x, spec.y, 6, spec.height - 18, 0x6ee7f2, 0.48);
    this.lockLine.setDepth(12.2);
    scene.physics.add.existing(this.rectangle, true);
    group.add(this.rectangle);
  }

  apply(timeline: TimelineKey, flags: Set<string>): boolean {
    const state = this.spec.states[timeline];
    const isUnlocked = this.spec.requiresFlags.every((flag) => flags.has(flag));
    const solid = state.solid && !isUnlocked;
    const visible = state.visible && !isUnlocked;
    const body = this.rectangle.body as Phaser.Physics.Arcade.StaticBody;

    this.rectangle.setVisible(visible);
    this.rectangle.setAlpha(visible ? state.alpha ?? 1 : 0);
    this.rectangle.setFillStyle(isUnlocked ? 0x73f2b2 : state.color);
    this.rectangle.setStrokeStyle(2, isUnlocked ? 0x73f2b2 : timelineAccent(timeline), isUnlocked ? 0.42 : 0.85);
    this.lockLine.setVisible(visible);
    this.lockLine.setAlpha(visible ? 0.62 : 0);
    this.lockLine.setFillStyle(isUnlocked ? 0x73f2b2 : timelineAccent(timeline), isUnlocked ? 0.18 : 0.62);
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
  private signal: Phaser.GameObjects.Rectangle;
  private visual?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, spec: PressurePlateSpec) {
    this.id = spec.id;
    this.flag = spec.flag;
    this.spec = spec;
    this.rectangle = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, 0x4a3648);
    this.rectangle.setDepth(11);
    this.rectangle.setStrokeStyle(2, 0x0a0f14, 0.9);
    if (scene.textures.exists(TextureKeys.plate)) {
      this.rectangle.setAlpha(0.01);
      this.visual = scene.add.image(spec.x, spec.y - 3, TextureKeys.plate);
      this.visual.setDepth(11.05);
      this.visual.setDisplaySize(spec.width, Math.max(18, spec.height * 2));
    }
    this.signal = scene.add.rectangle(spec.x, spec.y - 7, spec.width - 14, 3, 0xc46cff, 0.58);
    this.signal.setDepth(11.1);
    scene.physics.add.existing(this.rectangle, true);
  }

  update(timeline: TimelineKey, actors: TimelineActor[]): boolean {
    const available = this.isAvailableIn(timeline);
    const occupied = actors.some(({ sprite, timeline: actorTimeline }) => {
      return Boolean(sprite && this.isAvailableIn(actorTimeline) && boundsOverlap(this.rectangle, sprite));
    });
    this.active = occupied;
    this.rectangle.setAlpha(this.visual ? 0.01 : available ? 1 : 0.22);
    this.rectangle.setFillStyle(occupied ? 0xdbb3ff : 0x4a3648);
    if (this.visual) {
      this.visual.setAlpha(available ? 1 : occupied ? 0.65 : 0.28);
      this.visual.setTint(occupied ? 0xffffff : timelineAccent(timeline));
    }
    this.signal.setAlpha(occupied ? 0.95 : available ? 0.42 : 0.16);
    this.signal.setFillStyle(occupied ? 0xffffff : timelineAccent(timeline), occupied ? 0.85 : 0.42);
    return occupied;
  }

  private isAvailableIn(timeline: TimelineKey): boolean {
    return !this.spec.timelines || this.spec.timelines.includes(timeline);
  }
}

export class LeverSwitch {
  readonly id: string;
  readonly flag: string;
  readonly rectangle: Phaser.GameObjects.Rectangle;
  private spec: SwitchSpec;
  private toggled = false;
  private handle: Phaser.GameObjects.Rectangle;
  private visual?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, spec: SwitchSpec) {
    this.id = spec.id;
    this.flag = spec.flag;
    this.spec = spec;
    this.rectangle = scene.add.rectangle(spec.x, spec.y, spec.width, spec.height, 0x67452c);
    this.rectangle.setDepth(11);
    this.rectangle.setStrokeStyle(2, 0x0a0f14, 0.9);
    if (scene.textures.exists(TextureKeys.switchOff)) {
      this.rectangle.setAlpha(0.01);
      this.visual = scene.add.image(spec.x, spec.y - 8, TextureKeys.switchOff);
      this.visual.setDepth(11.25);
      this.visual.setDisplaySize(Math.max(58, spec.width * 1.45), Math.max(50, spec.height * 1.35));
    }
    this.handle = scene.add.rectangle(spec.x + 3, spec.y - 10, 6, 22, 0xefb14d, 0.88);
    this.handle.setVisible(!this.visual);
    this.handle.setAngle(-16);
    this.handle.setDepth(11.2);
    scene.physics.add.existing(this.rectangle, true);
  }

  update(
    timeline: TimelineKey,
    actor: Actor,
    interact: boolean,
    ghost: Actor,
    ghostInteract: boolean,
    ghostTimeline?: TimelineKey,
  ): boolean {
    const available = this.isAvailableIn(timeline);
    const playerUses = available && interact && actor && boundsOverlap(this.rectangle, actor, 24, 28);
    const ghostUses =
      ghostTimeline !== undefined && this.isAvailableIn(ghostTimeline) && ghostInteract && ghost && boundsOverlap(this.rectangle, ghost, 24, 28);

    this.rectangle.setAlpha(this.visual ? 0.01 : available ? 1 : 0.28);
    this.handle.setAlpha(this.visual ? 0 : available ? 0.9 : 0.22);
    this.handle.setFillStyle(this.toggled ? 0x73f2b2 : timelineAccent(timeline), this.toggled ? 0.95 : 0.82);
    this.handle.setAngle(this.toggled ? 18 : -16);
    if (this.visual) {
      this.visual.setTexture(this.toggled ? TextureKeys.switchOn : TextureKeys.switchOff);
      this.visual.setAlpha(available ? 1 : 0.28);
      this.visual.setTint(available ? 0xffffff : timelineAccent(timeline));
    }
    if (!this.toggled && (playerUses || ghostUses)) {
      this.toggled = true;
      this.rectangle.setFillStyle(0xe6c36a);
      return true;
    }

    this.rectangle.setFillStyle(this.toggled ? 0xe6c36a : 0x67452c);
    return false;
  }

  private isAvailableIn(timeline: TimelineKey): boolean {
    return !this.spec.timelines || this.spec.timelines.includes(timeline);
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

type OverlapTarget = Phaser.GameObjects.GameObject & {
  getBounds: () => Phaser.Geom.Rectangle;
  body?: unknown;
};

function boundsOverlap(a: OverlapTarget, b: OverlapTarget, inflateX = 0, inflateY = 0): boolean {
  const boundsA = collisionBounds(a);
  const boundsB = collisionBounds(b);
  boundsA.x -= inflateX;
  boundsA.y -= inflateY;
  boundsA.width += inflateX * 2;
  boundsA.height += inflateY * 2;
  return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
}

function collisionBounds(object: OverlapTarget): Phaser.Geom.Rectangle {
  const body = object.body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | undefined | null;
  if (body?.enable && !body.checkCollision.none) {
    return new Phaser.Geom.Rectangle(body.left, body.top, body.right - body.left, body.bottom - body.top);
  }
  return object.getBounds();
}

function timelineAccent(timeline: TimelineKey): number {
  if (timeline === 'past') {
    return 0xf0a64d;
  }
  if (timeline === 'present') {
    return 0x6ee7f2;
  }
  return 0xe0618a;
}

function platformVisualHeight(collisionHeight: number): number {
  return Math.max(46, Math.min(72, Math.round(collisionHeight * 1.3)));
}

function platformVisualY(spec: PlatformSpec | TimelineBlockSpec): number {
  return spec.y - spec.height / 2 - 2;
}
