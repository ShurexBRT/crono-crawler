import type { SaveState, SettingsState, TimelineKey } from '../types';

const STORAGE_KEY = 'chrono-crawler.save.v1';

const defaultSettings: SettingsState = {
  musicVolume: 0.45,
  sfxVolume: 0.7,
  fullscreen: false,
};

const defaultSave: SaveState = {
  hasContinue: false,
  currentLevelId: 'tutorial',
  timeline: 'present',
  settings: defaultSettings,
};

const timelineKeys: TimelineKey[] = ['past', 'present', 'future'];

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
}

function isTimelineKey(value: unknown): value is TimelineKey {
  return typeof value === 'string' && timelineKeys.includes(value as TimelineKey);
}

function normalizeSettings(settings?: Partial<SettingsState>): SettingsState {
  return {
    musicVolume: normalizeVolume(settings?.musicVolume, defaultSettings.musicVolume),
    sfxVolume: normalizeVolume(settings?.sfxVolume, defaultSettings.sfxVolume),
    fullscreen: Boolean(settings?.fullscreen),
  };
}

function normalizeVolume(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(1, Math.max(0, value));
}
