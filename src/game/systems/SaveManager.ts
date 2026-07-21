import type { SaveState, SettingsState, TimelineKey } from '../types';
import { getLevel } from '../content/levels';

const STORAGE_KEY = 'chrono-crawler.save.v1';

const defaultSettings: SettingsState = {
  musicVolume: 0.45,
  sfxVolume: 0.7,
  fullscreen: false,
  textScale: 1,
  reducedMotion: false,
  reducedFlashes: false,
};

const defaultSave: SaveState = {
  hasContinue: false,
  currentLevelId: 'tutorial',
  timeline: 'present',
  settings: defaultSettings,
};

const timelineKeys: TimelineKey[] = ['past', 'present', 'future'];

export interface ContinueSummary {
  levelTitle: string;
  checkpointLabel: string;
  timelineLabel: string;
  savedAtLabel: string;
}

export class SaveManager {
  private state: SaveState;

  constructor() {
    this.state = this.load();
  }

  getState(): SaveState {
    return {
      ...this.state,
      settings: { ...this.state.settings },
    };
  }

  hasContinue(): boolean {
    return this.state.hasContinue;
  }

  getContinueSummary(): ContinueSummary | undefined {
    if (!this.state.hasContinue) {
      return undefined;
    }

    const level = this.safeLevel(this.state.currentLevelId);
    return {
      levelTitle: level.title,
      checkpointLabel: this.state.checkpointId ? `Checkpoint: ${this.state.checkpointId}` : 'Start of level',
      timelineLabel: timelineLabel(this.state.timeline),
      savedAtLabel: savedAtLabel(this.state.updatedAt),
    };
  }

  getSettings(): SettingsState {
    return { ...this.state.settings };
  }

  updateSettings(settings: Partial<SettingsState>): SettingsState {
    this.state = {
      ...this.state,
      settings: normalizeSettings({
        ...this.state.settings,
        ...settings,
      }),
    };
    this.persist();
    return this.getSettings();
  }

  startNew(): SaveState {
    this.state = {
      ...defaultSave,
      hasContinue: true,
      updatedAt: Date.now(),
      settings: this.state.settings,
    };
    this.persist();
    return this.getState();
  }

  saveProgress(currentLevelId: string, timeline: TimelineKey, checkpointId?: string): void {
    this.state = {
      ...this.state,
      hasContinue: true,
      currentLevelId,
      timeline,
      checkpointId,
      updatedAt: Date.now(),
    };
    this.persist();
  }

  clearProgress(): void {
    this.state = {
      ...defaultSave,
      settings: this.state.settings,
    };
    this.persist();
  }

  private load(): SaveState {
    if (!this.canUseStorage()) {
      return { ...defaultSave, settings: { ...defaultSettings } };
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...defaultSave, settings: { ...defaultSettings } };
      }

      const parsed = JSON.parse(raw) as Partial<SaveState>;
      return {
        hasContinue: Boolean(parsed.hasContinue),
        currentLevelId: parsed.currentLevelId ?? defaultSave.currentLevelId,
        checkpointId: parsed.checkpointId,
        timeline: isTimelineKey(parsed.timeline) ? parsed.timeline : defaultSave.timeline,
        updatedAt: typeof parsed.updatedAt === 'number' && Number.isFinite(parsed.updatedAt) ? parsed.updatedAt : undefined,
        settings: normalizeSettings(parsed.settings),
      };
    } catch {
      return { ...defaultSave, settings: { ...defaultSettings } };
    }
  }

  private persist(): void {
    if (!this.canUseStorage()) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Storage can be present but unavailable in private or restricted browser contexts.
    }
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && 'localStorage' in window;
  }

  private safeLevel(levelId: string) {
    try {
      return getLevel(levelId);
    } catch {
      return getLevel(defaultSave.currentLevelId);
    }
  }
}

function isTimelineKey(value: unknown): value is TimelineKey {
  return typeof value === 'string' && timelineKeys.includes(value as TimelineKey);
}

function normalizeSettings(settings?: Partial<SettingsState>): SettingsState {
  return {
    musicVolume: normalizeVolume(settings?.musicVolume, defaultSettings.musicVolume),
    sfxVolume: normalizeVolume(settings?.sfxVolume, defaultSettings.sfxVolume),
    fullscreen: Boolean(settings?.fullscreen),
    textScale: normalizeTextScale(settings?.textScale),
    reducedMotion: Boolean(settings?.reducedMotion),
    reducedFlashes: Boolean(settings?.reducedFlashes),
  };
}

function normalizeVolume(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(1, Math.max(0, value));
}

function normalizeTextScale(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return defaultSettings.textScale;
  }
  return Math.min(1.25, Math.max(1, value));
}

function timelineLabel(timeline: TimelineKey): string {
  if (timeline === 'past') {
    return 'Past';
  }
  if (timeline === 'future') {
    return 'Ruined Future';
  }
  return 'Present';
}

function savedAtLabel(updatedAt?: number): string {
  if (!updatedAt) {
    return 'Legacy save';
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return formatter.format(new Date(updatedAt));
}
