import type { CheckpointSpec, LevelData, Point, TimelineKey } from '../types';
import type { CheckpointBeacon } from '../entities/LevelObjects';

export class CheckpointSystem {
  private active?: CheckpointSpec;
  private activeTimeline?: TimelineKey;

  constructor(
    private readonly level: LevelData,
    initialTimeline: TimelineKey,
    checkpointId?: string,
  ) {
    if (checkpointId) {
      this.resolveSpawn(initialTimeline, checkpointId);
    }
  }

  get activeCheckpoint(): CheckpointSpec | undefined {
    return this.active;
  }

  get checkpointTimeline(): TimelineKey | undefined {
    return this.activeTimeline;
  }

  checkpointLabel(): string {
    return this.active ? `Checkpoint: ${this.active.id}` : this.level.subtitle;
  }

  resolveSpawn(timeline: TimelineKey, checkpointId?: string): Point {
    if (!checkpointId) {
      return this.level.spawn;
    }

    const checkpoint = this.level.checkpoints.find((candidate) => candidate.id === checkpointId);
    if (!checkpoint) {
      return this.level.spawn;
    }

    this.active = checkpoint;
    this.activeTimeline = timeline;
    return { x: checkpoint.x, y: checkpoint.y - 24 };
  }

  update(beacons: CheckpointBeacon[], actor: Phaser.Physics.Arcade.Sprite, timeline: TimelineKey): CheckpointSpec | undefined {
    for (const beacon of beacons) {
      if (!beacon.update(actor)) {
        continue;
      }
      const checkpoint = this.level.checkpoints.find((candidate) => candidate.id === beacon.id);
      if (!checkpoint) {
        continue;
      }
      this.active = checkpoint;
      this.activeTimeline = timeline;
      return checkpoint;
    }
    return undefined;
  }

  rewindSpawn(): Point {
    if (!this.active) {
      return this.level.spawn;
    }
    return { x: this.active.x, y: this.active.y - 24 };
  }
}
