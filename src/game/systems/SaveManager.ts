import type { ProgressionState, SaveState, SettingsState, TimelineKey } from '../types';
import { getLevel } from '../content/levels';

const STORAGE_KEY = 'chrono-crawler.save.v2';
const LEGACY_STORAGE_KEY = 'chrono-crawler.save.v1';

const defaultSettings: SettingsState = {
  musicVolume: 0.45,
  sfxVolume: 0.7,
  fullscreen: false,
  textScale: 1,
  reducedMotion: false,
  reducedFlashes: false,
};

const defaultProgression: ProgressionState = {
  completedLevelIds: [],
  collectedMemoryFragmentIds: [],
  levelFlags: {},
  endingSeen: false,
};

const defaultSave: SaveState = {
  version: 2,
  hasContinue: false,
  currentLevelId: 'tutorial',
  timeline: 'present',
  settings: defaultSettings,
  progression: defaultProgression,
};

const timelineKeys: TimelineKey[] = ['past', 'present', 'future'];

export interface ContinueSummary {
  levelTitle: string;
  checkpointLabel: string;
  timelineLabel: string;
  savedAtLabel: string;
}

interface LoadResult {
  state: SaveState;
  migrated: boolean;
}

export class SaveManager {
  private state: SaveState;

  constructor() {
    const loaded = this.load();
    this.state = loaded.state;
    if (loaded.migrated) {
      this.persist();
    }
  }

  getState(): SaveState {
    return cloneSave(this.state);
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

  getProgression(): ProgressionState {
    return cloneProgression(this.state.progression);
  }

  getLevelFlags(levelId: string): string[] {
    return [...(this.state.progression.levelFlags[levelId] ?? [])];
  }

  saveLevelFlags(levelId: string, flags: Iterable<string>): void {
    const normalizedFlags = uniqueStrings(Array.from(flags));
    const existing = this.state.progression.levelFlags[levelId] ?? [];
    if (sameStrings(existing, normalizedFlags)) {
      return;
    }

    this.state = {
      ...this.state,
      progression: {
        ...this.state.progression,
        levelFlags: {
          ...this.state.progression.levelFlags,
          [levelId]: normalizedFlags,
        },
      },
      updatedAt: Date.now(),
    };
    this.persist();
  }

  isMemoryCollected(fragmentId: string): boolean {
    return this.state.progression.collectedMemoryFragmentIds.includes(fragmentId);
  }

  markMemoryCollected(fragmentId: string): void {
    if (this.isMemoryCollected(fragmentId)) {
      return;
    }

    this.state = {
      ...this.state,
      progression: {
        ...this.state.progression,
        collectedMemoryFragmentIds: uniqueStrings([...this.state.progression.collectedMemoryFragmentIds, fragmentId]),
      },
      updatedAt: Date.now(),
    };
    this.persist();
  }

  markLevelCompleted(levelId: string): void {
    if (this.state.progression.completedLevelIds.includes(levelId)) {
      return;
    }

    this.state = {
      ...this.state,
      progression: {
        ...this.state.progression,
        completedLevelIds: uniqueStrings([...this.state.progression.completedLevelIds, levelId]),
      },
      updatedAt: Date.now(),
    };
    this.persist();
  }

  markEndingSeen(): void {
    if (this.state.progression.endingSeen) {
      return;
    }

    this.state = {
      ...this.state,
      progression: {
        ...this.state.progression,
        endingSeen: true,
      },
      updatedAt: Date.now(),
    };
    this.persist();
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
      progression: cloneProgression(defaultProgression),
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
      progression: cloneProgression(defaultProgression),
    };
    this.persist();
  }

  private load(): LoadResult {
    if (!this.canUseStorage()) {
      return { state: freshDefaultSave(), migrated: false };
    }

    const current = this.readStorage(STORAGE_KEY);
    if (current) {
      return { state: normalizeSave(current), migrated: false };
    }

    const legacy = this.readStorage(LEGACY_STORAGE_KEY);
    if (legacy) {
      return { state: normalizeSave(legacy), migrated: true };
    }

    return { state: freshDefaultSave(), migrated: false };
  }

  private readStorage(key: string): Record<string, unknown> | undefined {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        return undefined;
      }
      const parsed = JSON.parse(raw) as unknown;
      return isRecord(parsed) ? parsed : undefined;
    } catch {
      return undefined;
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

function normalizeSave(parsed: Record<string, unknown>): SaveState {
  return {
    version: 2,
    hasContinue: Boolean(parsed.hasContinue),
    currentLevelId: typeof parsed.currentLevelId === 'string' ? parsed.currentLevelId : defaultSave.currentLevelId,
    checkpointId: typeof parsed.checkpointId === 'string' ? parsed.checkpointId : undefined,
    timeline: isTimelineKey(parsed.timeline) ? parsed.timeline : defaultSave.timeline,
    updatedAt: typeof parsed.updatedAt === 'number' && Number.isFinite(parsed.updatedAt) ? parsed.updatedAt : undefined,
    settings: normalizeSettings(isRecord(parsed.settings) ? (parsed.settings as Partial<SettingsState>) : undefined),
    progression: normalizeProgression(isRecord(parsed.progression) ? parsed.progression : undefined),
  };
}

function normalizeProgression(progression?: Record<string, unknown>): ProgressionState {
  const rawFlags = isRecord(progression?.levelFlags) ? progression.levelFlags : {};
  const levelFlags: Record<string, string[]> = {};
  Object.entries(rawFlags).forEach(([levelId, flags]) => {
    if (Array.isArray(flags)) {
      levelFlags[levelId] = uniqueStrings(flags);
    }
  });

  return {
    completedLevelIds: uniqueStrings(Array.isArray(progression?.completedLevelIds) ? progression.completedLevelIds : []),
    collectedMemoryFragmentIds: uniqueStrings(
      Array.isArray(progression?.collectedMemoryFragmentIds) ? progression.collectedMemoryFragmentIds : [],
    ),
    levelFlags,
    endingSeen: Boolean(progression?.endingSeen),
  };
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

function uniqueStrings(values: unknown[]): string[] {
  return [...new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0))].sort();
}

function sameStrings(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function cloneProgression(progression: ProgressionState): ProgressionState {
  return {
    completedLevelIds: [...progression.completedLevelIds],
    collectedMemoryFragmentIds: [...progression.collectedMemoryFragmentIds],
    levelFlags: Object.fromEntries(Object.entries(progression.levelFlags).map(([levelId, flags]) => [levelId, [...flags]])),
    endingSeen: progression.endingSeen,
  };
}

function cloneSave(save: SaveState): SaveState {
  return {
    ...save,
    settings: { ...save.settings },
    progression: cloneProgression(save.progression),
  };
}

function freshDefaultSave(): SaveState {
  return {
    ...defaultSave,
    settings: { ...defaultSettings },
    progression: cloneProgression(defaultProgression),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
