export type TimelineKey = 'past' | 'present' | 'future';

export interface SettingsState {
  musicVolume: number;
  sfxVolume: number;
  fullscreen: boolean;
  textScale: number;
  reducedMotion: boolean;
  reducedFlashes: boolean;
}

export interface SaveState {
  hasContinue: boolean;
  currentLevelId: string;
  checkpointId?: string;
  timeline: TimelineKey;
  settings: SettingsState;
}

export interface Point {
  x: number;
  y: number;
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
}

export interface EnemySpec extends Point {
  id: string;
  patrolMinX: number;
  patrolMaxX: number;
  speed: number;
}

export interface CheckpointSpec extends Point {
  id: string;
}

export interface StoryZoneSpec extends RectSpec {
  id: string;
  lines: string[];
  once?: boolean;
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
  background: 'reactor' | 'streets' | 'greenhouse' | 'station' | 'core';
  platforms: PlatformSpec[];
  timelineBlocks: TimelineBlockSpec[];
  doors: DoorSpec[];
  plates: PressurePlateSpec[];
  switches: SwitchSpec[];
  enemies: EnemySpec[];
  checkpoints: CheckpointSpec[];
  storyZones: StoryZoneSpec[];
  exit: RectSpec;
  requiredExitFlags?: string[];
}
