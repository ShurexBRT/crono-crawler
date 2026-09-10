import type { TimelineKey } from '../types';

export interface GhostFrame {
  t: number;
  x: number;
  y: number;
  flipX: boolean;
  interact: boolean;
  timeline: TimelineKey;
  heldPlateFlags: string[];
}

export class GhostRecorder {
  readonly maxDurationMs = 8000;
  private frames: GhostFrame[] = [];
  private elapsedMs = 0;
  private active = false;

  get isRecording(): boolean {
    return this.active;
  }

  get progress(): number {
    if (!this.active) {
      return 0;
    }
    return Math.min(1, this.elapsed / this.maxDurationMs);
  }

  get elapsed(): number {
    return this.elapsedMs;
  }

  start(): void {
    this.frames = [];
    this.elapsedMs = 0;
    this.active = true;
  }

  capture(
    x: number,
    y: number,
    flipX: boolean,
    interact: boolean,
    timeline: TimelineKey,
    heldPlateFlags: string[],
    deltaMs: number,
  ): GhostFrame[] | undefined {
    if (!this.active) {
      return undefined;
    }

    this.elapsedMs += deltaMs;
    const t = Math.min(this.elapsed, this.maxDurationMs);
    this.frames.push({ t, x, y, flipX, interact, timeline, heldPlateFlags: [...heldPlateFlags] });

    if (t >= this.maxDurationMs) {
      return this.stop();
    }
    return undefined;
  }

  stop(): GhostFrame[] {
    this.active = false;
    if (this.frames.length === 0) {
      return [];
    }
    return [...this.frames];
  }
}
