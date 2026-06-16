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
      settings: {
        ...this.state.settings,
        ...settings,
      },
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

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...defaultSave, settings: { ...defaultSettings } };
    }

    try {
      const parsed = JSON.parse(raw) as Partial<SaveState>;
      return {
        hasContinue: Boolean(parsed.hasContinue),
        currentLevelId: parsed.currentLevelId ?? defaultSave.currentLevelId,
        checkpointId: parsed.checkpointId,
        timeline: parsed.timeline ?? defaultSave.timeline,
        settings: {
          ...defaultSettings,
          ...(parsed.settings ?? {}),
        },
      };
    } catch {
      return { ...defaultSave, settings: { ...defaultSettings } };
    }
  }

  private persist(): void {
    if (!this.canUseStorage()) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  private canUseStorage(): boolean {
    return typeof window !== 'undefined' && 'localStorage' in window;
  }
}
