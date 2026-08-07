import type { LevelData } from '../types';

export interface LevelValidationIssue {
  levelId: string;
  message: string;
}

export function validateLevels(levels: LevelData[]): LevelValidationIssue[] {
  const issues: LevelValidationIssue[] = [];
  const levelIds = new Set<string>();
  const memoryIds = new Set<string>();

  levels.forEach((level) => {
    if (levelIds.has(level.id)) {
      issues.push(issue(level.id, `Duplicate level id: ${level.id}`));
    }
    levelIds.add(level.id);
  });

  levels.forEach((level) => {
    validateLevel(level, issues, memoryIds);
    if (level.nextLevelId && !levelIds.has(level.nextLevelId)) {
      issues.push(issue(level.id, `nextLevelId points to missing level: ${level.nextLevelId}`));
    }
  });

  return issues;
}

function validateLevel(level: LevelData, issues: LevelValidationIssue[], memoryIds: Set<string>): void {
  if (!level.id.trim()) {
    issues.push(issue(level.id, 'Level id must not be empty.'));
  }
  if (!level.title.trim()) {
    issues.push(issue(level.id, 'Level title must not be empty.'));
  }
  if (!level.objective.trim()) {
    issues.push(issue(level.id, 'Level objective must not be empty.'));
  }
  if (!isPositiveFinite(level.width) || !isPositiveFinite(level.height)) {
    issues.push(issue(level.id, 'Level width and height must be positive finite numbers.'));
  }
  if (!pointInsideLevel(level.spawn.x, level.spawn.y, level)) {
    issues.push(issue(level.id, `Spawn is outside level bounds: ${level.spawn.x}, ${level.spawn.y}`));
  }
  if (!pointInsideLevel(level.exit.x, level.exit.y, level)) {
    issues.push(issue(level.id, `Exit center is outside level bounds: ${level.exit.x}, ${level.exit.y}`));
  }
  if (!isPositiveFinite(level.exit.width) || !isPositiveFinite(level.exit.height)) {
    issues.push(issue(level.id, 'Exit width and height must be positive finite numbers.'));
  }

  validateCamera(level, issues);
  validateUniqueIds(level, issues);
  validateFlags(level, issues);

  (level.memoryFragments ?? []).forEach((fragment) => {
    if (memoryIds.has(fragment.id)) {
      issues.push(issue(level.id, `Memory fragment id must be globally unique: ${fragment.id}`));
    }
    memoryIds.add(fragment.id);
  });
}

function validateCamera(level: LevelData, issues: LevelValidationIssue[]): void {
  const camera = level.camera;
  if (!camera) {
    return;
  }

  if (camera.followLerp) {
    if (!isUnitInterval(camera.followLerp.x) || !isUnitInterval(camera.followLerp.y)) {
      issues.push(issue(level.id, 'Camera followLerp x/y must be finite values between 0 and 1.'));
    }
  }

  if (camera.deadzone) {
    if (!isPositiveFinite(camera.deadzone.width) || !isPositiveFinite(camera.deadzone.height)) {
      issues.push(issue(level.id, 'Camera deadzone width/height must be positive finite numbers.'));
    }
  }

  if (camera.followOffset) {
    if (!Number.isFinite(camera.followOffset.x) || !Number.isFinite(camera.followOffset.y)) {
      issues.push(issue(level.id, 'Camera followOffset x/y must be finite numbers.'));
    }
  }

  if (camera.zoom !== undefined && !isPositiveFinite(camera.zoom)) {
    issues.push(issue(level.id, 'Camera zoom must be a positive finite number.'));
  }
}

function validateUniqueIds(level: LevelData, issues: LevelValidationIssue[]): void {
  const collections: Array<[string, Array<{ id: string }>]> = [
    ['platform', level.platforms],
    ['timeline block', level.timelineBlocks],
    ['door', level.doors],
    ['pressure plate', level.plates],
    ['switch', level.switches],
    ['enemy', level.enemies],
    ['hazard', level.hazards ?? []],
    ['checkpoint', level.checkpoints],
    ['story zone', level.storyZones],
    ['memory fragment', level.memoryFragments ?? []],
  ];

  collections.forEach(([label, entries]) => {
    const ids = new Set<string>();
    entries.forEach((entry) => {
      if (!entry.id.trim()) {
        issues.push(issue(level.id, `${label} id must not be empty.`));
        return;
      }
      if (ids.has(entry.id)) {
        issues.push(issue(level.id, `Duplicate ${label} id: ${entry.id}`));
      }
      ids.add(entry.id);
    });
  });
}

function validateFlags(level: LevelData, issues: LevelValidationIssue[]): void {
  const producedFlags = new Set<string>([
    ...level.plates.map((plate) => plate.flag),
    ...level.switches.map((lever) => lever.flag),
  ]);

  level.doors.forEach((door) => {
    door.requiresFlags.forEach((flag) => {
      if (!producedFlags.has(flag)) {
        issues.push(issue(level.id, `Door ${door.id} requires flag with no producer in this level: ${flag}`));
      }
    });
  });

  (level.requiredExitFlags ?? []).forEach((flag) => {
    if (!producedFlags.has(flag)) {
      issues.push(issue(level.id, `Exit requires flag with no producer in this level: ${flag}`));
    }
  });
}

function pointInsideLevel(x: number, y: number, level: LevelData): boolean {
  return Number.isFinite(x) && Number.isFinite(y) && x >= 0 && x <= level.width && y >= 0 && y <= level.height;
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function isUnitInterval(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 1;
}

function issue(levelId: string, message: string): LevelValidationIssue {
  return { levelId: levelId || '<unknown>', message };
}
