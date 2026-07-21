import type { LevelData } from '../types';

export type ExitAttempt =
  | { status: 'complete'; nextLevelId?: string }
  | { status: 'blocked'; missingFlags: string[]; showToast: boolean }
  | { status: 'already-complete' };

const BLOCKED_TOAST_INTERVAL_MS = 2200;

export class LevelFlowSystem {
  private complete = false;
  private blockedToastAt = 0;

  constructor(private readonly level: LevelData) {}

  get isComplete(): boolean {
    return this.complete;
  }

  attemptExit(flags: Set<string>, now: number): ExitAttempt {
    if (this.complete) {
      return { status: 'already-complete' };
    }

    const missingFlags = (this.level.requiredExitFlags ?? []).filter((flag) => !flags.has(flag));
    if (missingFlags.length > 0) {
      const showToast = now - this.blockedToastAt > BLOCKED_TOAST_INTERVAL_MS;
      if (showToast) {
        this.blockedToastAt = now;
      }
      return { status: 'blocked', missingFlags, showToast };
    }

    this.complete = true;
    return { status: 'complete', nextLevelId: this.level.nextLevelId };
  }
}
