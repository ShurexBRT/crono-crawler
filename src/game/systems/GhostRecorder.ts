export interface GhostFrame {
  t: number;
  x: number;
  y: number;
  flipX: boolean;
  interact: boolean;
}

export class GhostRecorder {
  readonly maxDurationMs = 8000;
  private frames: GhostFrame[] = [];
  private recordingStartedAt = 0;
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
    return performance.now() - this.recordingStartedAt;
  }

  start(): void {
    this.frames = [];
    this.recordingStartedAt = performance.now();
    this.active = true;
  }

  capture(x: number, y: number, flipX: boolean, interact: boolean): GhostFrame[] | undefined {
    if (!this.active) {
      return undefined;
    }

    const t = this.elapsed;
    this.frames.push({ t, x, y, flipX, interact });

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
    const last = this.frames[this.frames.length - 1];
    if (last.t < this.maxDurationMs) {
      this.frames.push({
        ...last,
        t: this.maxDurationMs,
      });
    }
    return [...this.frames];
  }
}
