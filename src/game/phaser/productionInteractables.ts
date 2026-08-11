import type Phaser from 'phaser';
import { TextureKeys } from '../assets/manifest';
import { LeverSwitch, PressurePlate, TimelineBlock, TimelineDoor } from '../entities/LevelObjects';
import type { TimelineKey } from '../types';

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

type VisualOwner = { visual?: Phaser.GameObjects.Image };
type SwitchVisualOwner = VisualOwner & { toggled?: boolean; isToggled?: boolean };

patchTimelineBlocks();
patchDoors();
patchPlates();
patchSwitches();

function patchTimelineBlocks(): void {
  const proto = TimelineBlock.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
  const original = proto.applyTimeline;
  proto.applyTimeline = function productionBlockTimeline(this: VisualOwner, timeline: TimelineKey): void {
    original.call(this, timeline);
    const visual = this.visual;
    if (visual?.scene.textures.exists(platformKeys[timeline])) {
      visual.setTexture(platformKeys[timeline]);
    }
  };
}

function patchDoors(): void {
  const proto = TimelineDoor.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
  const original = proto.apply;
  proto.apply = function productionDoorApply(this: VisualOwner, timeline: TimelineKey, flags: Set<string>): boolean {
    const opened = Boolean(original.call(this, timeline, flags));
    const visual = this.visual;
    if (visual?.scene.textures.exists(doorKeys[timeline])) {
      visual.setTexture(doorKeys[timeline]);
    }
    return opened;
  };
}

function patchPlates(): void {
  const proto = PressurePlate.prototype as unknown as Record<string, (...args: unknown[]) => unknown>;
  const original = proto.update;
  proto.update = function productionPlateUpdate(this: VisualOwner, ...args: unknown[]): boolean {
    const timeline = args[0] as TimelineKey;
    const occupied = Boolean(original.apply(this, args));
    const visual = this.visual;
    if (visual?.scene.textures.exists(plateKeys[timeline])) {
      visual.setTexture(plateKeys[timeline]);
      if (occupied) {
        visual.setY(visual.y + 2);
      }
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
    }
    return changed;
  };
}
