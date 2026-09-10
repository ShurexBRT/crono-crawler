export type TimelineKey = 'past' | 'present' | 'future';

export interface SettingsState {
  musicVolume: number;
  sfxVolume: number;
  fullscreen: boolean;
  textScale: number;
  reducedMotion: boolean;
  reducedFlashes: boolean;
}

export interface ProgressionState {
  completedLevelIds: string[];
  collectedMemoryFragmentIds: string[];
  readMemoryFragmentIds: string[];
  lastViewedMemoryId?: string;
  levelFlags: Record<string, string[]>;
  endingSeen: boolean;
  levelStoryIds: Record<string, string[]>;
  checkpointTimeline?: TimelineKey;
}

export interface LevelProgress {
  latchedFlags: string[];
  seenStoryIds: string[];
  checkpointTimeline?: TimelineKey;
}

export interface SaveState {
  version: 2;
  hasContinue: boolean;
  currentLevelId: string;
  checkpointId?: string;
  timeline: TimelineKey;
  updatedAt?: number;
  settings: SettingsState;
  progression: ProgressionState;
}

export interface Point {
  x: number;
  y: number;
}

export interface CameraSpec {
  followLerp?: Point;
  deadzone?: {
    width: number;
    height: number;
  };
  followOffset?: Point;
  zoom?: number;
}

export interface RectSpec extends Point {
  width: number;
  height: number;
}

export interface TimelineVisualState {
  solid: boolean;
  visible: boolean;
  color: number;
  alpha?: number;
  label?: string;
}

export interface PlatformSpec extends RectSpec {
  id: string;
  color?: number;
}

export interface TimelineBlockSpec extends RectSpec {
  id: string;
  states: Record<TimelineKey, TimelineVisualState>;
}

export interface DoorSpec extends RectSpec {
  id: string;
  requiresFlags: string[];
  states: Record<TimelineKey, TimelineVisualState>;
}

export interface PressurePlateSpec extends RectSpec {
  id: string;
  flag: string;
  timelines?: TimelineKey[];
}

export interface SwitchSpec extends RectSpec {
  id: string;
  flag: string;
  timelines?: TimelineKey[];
  requiresFlags?: string[];
  latchesFlags?: string[];
}

export interface EnemySpec extends Point {
  id: string;
  patrolMinX: number;
  patrolMaxX: number;
  speed: number;
}

export interface HazardSpec extends RectSpec {
  id: string;
  timelines?: TimelineKey[];
  message?: string;
  color?: number;
}

export interface CheckpointSpec extends Point {
  id: string;
  label?: string;
}

export interface StoryZoneSpec extends RectSpec {
  id: string;
  lines: string[];
  once?: boolean;
}

export interface MemoryFragmentSpec extends Point {
  id: string;
  title: string;
  lines: string[];
  width?: number;
  height?: number;
}

export interface LevelData {
  id: string;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  spawn: Point;
  objective: string;
  nextLevelId?: string;
  startTimeline: TimelineKey;
  startLines: string[];
  background: 'reactor' | 'streets' | 'greenhouse' | 'station' | 'canals' | 'core';
  camera?: CameraSpec;
  objectives?: { flag: string; label: string }[];
  platforms: PlatformSpec[];
  timelineBlocks: TimelineBlockSpec[];
  doors: DoorSpec[];
  plates: PressurePlateSpec[];
  switches: SwitchSpec[];
  enemies: EnemySpec[];
  hazards?: HazardSpec[];
  checkpoints: CheckpointSpec[];
  storyZones: StoryZoneSpec[];
  memoryFragments?: MemoryFragmentSpec[];
  exit: RectSpec;
  requiredExitFlags?: string[];
}
