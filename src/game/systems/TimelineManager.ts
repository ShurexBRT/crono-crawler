import type { TimelineKey } from '../types';

const order: TimelineKey[] = ['past', 'present', 'future'];

export class TimelineManager {
  private currentTimeline: TimelineKey;

  constructor(initialTimeline: TimelineKey) {
    this.currentTimeline = initialTimeline;
  }

  get current(): TimelineKey {
    return this.currentTimeline;
  }

  set(timeline: TimelineKey): boolean {
    if (timeline === this.currentTimeline) {
      return false;
    }
    this.currentTimeline = timeline;
    return true;
  }

  cycle(): TimelineKey {
    const index = order.indexOf(this.currentTimeline);
    this.currentTimeline = order[(index + 1) % order.length];
    return this.currentTimeline;
  }

  label(): string {
    return this.currentTimeline === 'past'
      ? 'Past'
      : this.currentTimeline === 'present'
        ? 'Present'
        : 'Ruined Future';
  }
}
