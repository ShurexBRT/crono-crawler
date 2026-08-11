import type Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import { LeverSwitch, PressurePlate, TimelineBlock, TimelineDoor } from '../entities/LevelObjects';
import type { DoorSpec, PressurePlateSpec, SwitchSpec, TimelineBlockSpec, TimelineKey } from '../types';

const platformKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionPlatformPast,
  present: TextureKeys.productionPlatformPresent,
  future: TextureKeys.productionPlatformFuture,
};
const doorKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionDoorPast,
  present: TextureKeys.productionDoorPresent,
  future: TextureKeys.productionDoorFuture,
};
const plateKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionPlatePast,
  present: TextureKeys.productionPlatePresent,
  future: TextureKeys.productionPlateFuture,
};
const switchOffKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionSwitchPastOff,
  present: TextureKeys.productionSwitchPresentOff,
  future: TextureKeys.productionSwitchFutureOff,
};
const switchOnKeys: Record<TimelineKey, string> = {
  past: TextureKeys.productionSwitchPastOn,
  present: TextureKeys.productionSwitchPresentOn,
  future: TextureKeys.productionSwitchFutureOn,
};

type BlockVisualOwner = { visual?: Phaser.GameObjects.Image; spec: TimelineBlockSpec };
type DoorVisualOwner = { visual?: Phaser.GameObjects.Image; spec: DoorSpec };
type PlateVisualOwner = { visual?: Phaser.GameObjects.Image; spec: PressurePlateSpec };
type SwitchVisualOwner = { visual?: Phaser.GameObjects.Image; spec: SwitchSpec; toggled?: boolean; isToggled?: boolean };

patchTimelineBlocks();
patchDoors();
patchPlates();
patchSwitches();

function patchTimelineBlocks(): void {
  const proto = TimelineBlock.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
  const original = proto.applyTimeline;
  proto.applyTimeline = function productionBlockTimeline(this: BlockVisualOwner, timeline: TimelineKey): void {
    original.call(this, timeline);
    const visual = this.visual;
    if (visual?.scene.textures.exists(platformKeys[timeline])) {
      visual.setTexture(platformKeys[timeline]);
      visual.setDisplaySize(this.spec.width, Math.max(42, this.spec.height + 24));
    }
  };
}

function patchDoors(): void {
  const proto = TimelineDoor.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
  const original = proto.apply;
  proto.apply = function productionDoorApply(this: DoorVisualOwner, timeline: TimelineKey, flags: Set<string>): boolean {
    const opened = Boolean(original.call(this, timeline, flags));
    const visual = this.visual;
    if (visual?.scene.textures.exists(doorKeys[timeline])) {
      visual.setTexture(doorKeys[timeline]);
      visual.setDisplaySize(Math.max(this.spec.width * 1.45, 88), Math.max(this.spec.height * 1.08, 136));
    }
    return opened;
  };
}

function patchPlates(): void {
  const proto = PressurePlate.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
  const original = proto.update;
  proto.update = function productionPlateUpdate(this: PlateVisualOwner, ...args: unknown[]): boolean {
    const timeline = args[0] as TimelineKey;
    const occupied = Boolean(original.apply(this, args));
    const visual = this.visual;
    if (visual?.scene.textures.exists(plateKeys[timeline])) {
      visual.setTexture(plateKeys[timeline]);
      visual.setDisplaySize(this.spec.width, Math.max(18, this.spec.height * 2));
      visual.setScale(visual.scaleX, visual.scaleY * (occupied ? 0.9 : 1));
    }
    return occupied;
  };
}

function patchSwitches(): void {
  const proto = LeverSwitch.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
  const original = proto.update;
  proto.update = function productionSwitchUpdate(this: SwitchVisualOwner, ...args: unknown[]): boolean {
    const timeline = args[0] as TimelineKey;
    const changed = Boolean(original.apply(this, args));
    const visual = this.visual;
    const toggled = Boolean(this.toggled ?? this.isToggled);
    const key = toggled ? switchOnKeys[timeline] : switchOffKeys[timeline];
    if (visual?.scene.textures.exists(key)) {
      visual.setTexture(key);
      visual.setDisplaySize(Math.max(58, this.spec.width * 1.45), Math.max(50, this.spec.height * 1.35));
    }
    return changed;
  };
}
