import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { campaignBackdrops } from '../../src/game/assets/backdrops';
import { backdropExtent, coverScale } from '../../src/game/phaser/rendering/backdropLayout';
import { levels, getLevel } from '../../src/game/content/levels';
import { validateLevels } from '../../src/game/content/levelValidation';
import { SaveManager } from '../../src/game/systems/SaveManager';
import { LevelFlowSystem } from '../../src/game/systems/LevelFlowSystem';
import { GhostRecorder } from '../../src/game/systems/GhostRecorder';
import { CheckpointSystem } from '../../src/game/systems/CheckpointSystem';
import type { TimelineKey } from '../../src/game/types';
import { getMemoryArtifact, memoryArtifacts } from '../../src/game/content/memory-artifacts';
import { renderMemoryArtifact } from '../../src/ui/MemoryArtifactView';
import { watchFocusLoss } from '../../src/game/systems/FocusLossGuard';
import { MemoryVaultModel } from '../../src/ui/MemoryVaultModel';
import { MemoryVaultView, renderVaultPages } from '../../src/ui/MemoryVaultView';

let passed = 0;
function check(name: string, test: () => void) {
  try {
    storage.clear();
    storageWriteFails = false;
    storageReadFails = false;
    test();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    process.exitCode = 1;
    console.error(`FAIL ${name}`, error);
  }
}

const storage = new Map<string, string>();
let storageWriteFails = false;
let storageReadFails = false;
Object.defineProperty(globalThis, 'window', { value: { localStorage: {
  getItem: (key: string) => {
    if (storageReadFails) throw new Error('Storage access denied');
    return storage.get(key) ?? null;
  },
  setItem: (key: string, value: string) => {
    if (storageWriteFails) throw new Error('Storage quota exceeded');
    storage.set(key, value);
  },
} }, configurable: true });
const key = 'chrono-crawler.save.v1';

check('authored level data passes structural validation', () => {
  assert.deepEqual(validateLevels(levels), []);
});

check('every stage has its own production backdrop with a valid high-resolution PNG', () => {
  const keys = new Set<string>();
  let totalBytes = 0;
  for (const level of levels) {
    const backdrop = campaignBackdrops[level.id];
    assert.ok(backdrop, level.id);
    assert.ok(!keys.has(backdrop.key), `${level.id}: duplicated backdrop`);
    keys.add(backdrop.key);
    assert.ok(existsSync(backdrop.path), backdrop.path);
    const png = readFileSync(backdrop.path);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.ok(png.readUInt32BE(16) >= 1500 && png.readUInt32BE(20) >= 840, backdrop.path);
    totalBytes += png.length;
  }
  assert.ok(totalBytes < 35_000_000, 'Backdrop download budget exceeded');
  for (const path of ['assets/sprites/elias-production-source.png', 'assets/sprites/story-characters-production.png']) {
    const png = readFileSync(path);
    assert.equal(png[25], 6, `${path}: sprites need an RGBA channel`);
  }
});

check('parallax covers both ends of horizontal and vertical cameras without stretching', () => {
  for (const level of levels) {
    const extent = backdropExtent(level.width, level.height, .12, .1);
    const scale = coverScale(1672, 941, extent.width, extent.height);
    for (const fraction of [0, .5, 1]) {
      const scrollX = Math.max(0, level.width - 1280) * fraction;
      const scrollY = Math.max(0, level.height - 720) * fraction;
      assert.ok(1672 * scale - scrollX * .12 >= 1280);
      assert.ok(941 * scale - scrollY * .1 >= 720);
    }
  }
});

check('all chapters have authored openings and the canonical identity stays consistent', () => {
  assert.equal(levels.flatMap((level) => level.memoryFragments ?? []).length, 9);
  for (const level of levels) {
    assert.ok(level.startLines.length >= 2, level.id);
    const text = JSON.stringify(level);
    assert.ok(!text.includes('Elias Voss'));
    assert.ok(!text.includes('thing in his chest'));
  }
});

check('every collectible has one unique generated memory artifact and readable narrative content', () => {
  const memories = levels.flatMap((level) => level.memoryFragments ?? []);
  assert.deepEqual(memoryArtifacts.map((artifact) => artifact.id).sort(), memories.map((memory) => memory.id).sort());
  assert.equal(new Set(memoryArtifacts.map((artifact) => artifact.image)).size, memories.length);
  let totalBytes = 0;
  for (const memory of memories) {
    const artifact = getMemoryArtifact(memory.id)!;
    assert.ok(artifact.alt.length > 30 && artifact.caption.length > 10);
    const png = readFileSync(artifact.image);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.ok(png.readUInt32BE(16) >= 1000 && png.readUInt32BE(20) >= 1000, artifact.image);
    totalBytes += png.length;
    const html = renderMemoryArtifact(artifact, memory.lines, true);
    assert.ok(html.includes('aria-modal="true"'));
    assert.ok(html.includes('Memory Recovered'));
    assert.ok(html.includes('data-action="memory-close"'));
    assert.equal(Boolean(artifact.letter), html.includes('data-memory-letter'));
  }
  assert.ok(totalBytes < 30_000_000, 'Memory source image budget exceeded');
  assert.equal(getMemoryArtifact('missing'), undefined);
});

check('memory letters stay distinct, selectable and safely escaped', () => {
  const mara = getMemoryArtifact('rain-lamp-letter')!;
  const elias = getMemoryArtifact('archive-unsent-letter')!;
  assert.equal(mara.letter?.signature, 'Love, Mara');
  assert.equal(elias.letter?.signature, 'Dad');
  assert.ok(mara.letter!.paragraphs.join(' ').includes('Just come with me'));
  assert.ok(elias.letter!.paragraphs.join(' ').includes('terrible singing'));
  const html = renderMemoryArtifact({ ...mara, title: '<script>alert(1)</script>', caption: '"<img onerror="bad">' }, ['<b>Untrusted</b>'], false);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<b>Untrusted</b>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('From the Journal'));
  assert.ok(html.includes('Dear Dad,'));
  assert.ok(html.includes('Love, Mara'));
});

check('the campaign visits all 12 unique stages and ends at the Keeper', () => {
  assert.equal(new Set(levels.map((level) => level.id)).size, 12);
  const seen = new Set<string>();
  let level = getLevel('tutorial');
  while (true) {
    assert.ok(!seen.has(level.id), `Campaign cycle at ${level.id}`);
    seen.add(level.id);
    if (!level.nextLevelId) break;
    level = getLevel(level.nextLevelId);
  }
  assert.equal(level.id, 'boss');
  assert.equal(seen.size, levels.length);
});

const vaultEntries = levels.flatMap((level) => (level.memoryFragments ?? []).map((memory) => ({ ...memory, levelTitle: level.title, artifact: getMemoryArtifact(memory.id) })));

check('the generated vault book has the documented dimensions and source checksum', () => {
  const book = readFileSync('assets/ui/memory-vault-book.png');
  assert.equal(book.subarray(1, 4).toString(), 'PNG');
  assert.equal(book.readUInt32BE(16), 1536);
  assert.equal(book.readUInt32BE(20), 1024);
  assert.equal(createHash('sha256').update(book).digest('hex'), 'f4cca0e079ea9f0425a7ff58054f2d681ad934aa7eef0ad9dbae7ed00ce3719a');
});

check('vault navigation clamps pages and never marks locked or unknown memories as read', () => {
  const model = new MemoryVaultModel(vaultEntries, ['reactor-daughter-sketch', 'unknown'], ['rain-lamp-letter', 'unknown'], 'rain-lamp-letter');
  assert.equal(model.index, 0);
  assert.equal(model.totalPages, 10);
  assert.equal(model.unreadCount, 1);
  assert.equal(model.readCurrent(), undefined);
  model.goToEntry('rain-lamp-letter');
  assert.equal(model.readCurrent(), undefined);
  model.goToEntry('reactor-daughter-sketch');
  assert.equal(model.readCurrent(), 'reactor-daughter-sketch');
  assert.equal(model.unreadCount, 0);
  model.goTo(-50);
  assert.equal(model.index, 0);
  assert.equal(model.canPrevious, false);
  model.goTo(500);
  assert.equal(model.index, 9);
  assert.equal(model.canNext, false);
  model.goTo(Number.NaN);
  model.goToEntry('unknown');
  assert.equal(model.index, 9);
});

check('vault locked pages never include unrecovered art, letters or prose', () => {
  const model = new MemoryVaultModel(vaultEntries, [], []);
  for (const entry of vaultEntries) {
    model.goToEntry(entry.id);
    const html = renderVaultPages(model);
    assert.ok(html.includes('Unrecovered'));
    assert.ok(!html.includes('data-vault-art'));
    assert.ok(!html.includes('data-vault-letter'));
    assert.ok(!html.includes(entry.lines[0]));
    assert.ok(!html.includes(entry.artifact!.image));
  }
});

check('vault spreads render real letter text, escape content and restore the bookmark', () => {
  const model = new MemoryVaultModel(vaultEntries, ['rain-lamp-letter'], [], 'rain-lamp-letter');
  assert.equal(model.current?.id, 'rain-lamp-letter');
  const html = renderVaultPages(model);
  assert.ok(html.includes('Dear Dad,'));
  assert.ok(html.includes('Love, Mara'));
  assert.ok(html.includes('data-vault-letter'));
  const malicious = { ...vaultEntries[0], lines: ['<script>bad</script>'], artifact: { ...vaultEntries[0].artifact!, title: '<b>Unsafe</b>' } };
  const escaped = renderVaultPages(new MemoryVaultModel([malicious], [malicious.id], [], malicious.id));
  assert.ok(escaped.includes('&lt;script&gt;bad&lt;/script&gt;'));
  assert.ok(!escaped.includes('<b>Unsafe</b>'));
});

check('vault read state and bookmark persist without changing the gameplay save time', () => {
  const save = new SaveManager();
  save.startNew();
  save.markMemoryCollected('rain-lamp-letter');
  const updatedAt = save.getState().updatedAt;
  save.visitMemory('rain-lamp-letter');
  save.visitMemory('rain-lamp-letter');
  save.visitMemory('reactor-daughter-sketch');
  const restored = new SaveManager().getProgression();
  assert.deepEqual(restored.readMemoryFragmentIds, ['rain-lamp-letter']);
  assert.equal(restored.lastViewedMemoryId, 'rain-lamp-letter');
  assert.equal(save.getState().updatedAt, updatedAt);
  const copy = save.getProgression();
  copy.readMemoryFragmentIds.push('unknown');
  assert.deepEqual(save.getProgression().readMemoryFragmentIds, ['rain-lamp-letter']);
  save.startNew();
  assert.deepEqual(save.getProgression().readMemoryFragmentIds, []);
  assert.equal(save.getProgression().lastViewedMemoryId, undefined);
});

check('legacy saves get an unread vault and malformed read state cannot unlock a memory', () => {
  storage.set(key, JSON.stringify({ collectedMemoryIds: ['rain-lamp-letter'] }));
  assert.deepEqual(new SaveManager().getProgression().readMemoryFragmentIds, []);
  storage.set('chrono-crawler.save.v2', JSON.stringify({ progression: {
    collectedMemoryFragmentIds: ['rain-lamp-letter'],
    readMemoryFragmentIds: ['rain-lamp-letter', 'rain-lamp-letter', 'reactor-daughter-sketch', 7],
    lastViewedMemoryId: 'reactor-daughter-sketch',
  } }));
  const progress = new SaveManager().getProgression();
  assert.deepEqual(progress.readMemoryFragmentIds, ['rain-lamp-letter']);
  assert.equal(progress.lastViewedMemoryId, undefined);
});

check('reopening a read page retries a failed bookmark save', () => {
  const save = new SaveManager();
  save.markMemoryCollected('rain-lamp-letter');
  storageWriteFails = true;
  save.visitMemory('rain-lamp-letter');
  assert.equal(save.getPersistenceStatus(), 'error');
  assert.equal(new SaveManager().getProgression().lastViewedMemoryId, undefined);
  storageWriteFails = false;
  save.visitMemory('rain-lamp-letter');
  assert.equal(save.getPersistenceStatus(), 'ready');
  assert.equal(new SaveManager().getProgression().lastViewedMemoryId, 'rain-lamp-letter');
});

check('vault gamepad polling consumes fresh edges without repeating held buttons', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'requestAnimationFrame');
  Object.defineProperty(globalThis, 'requestAnimationFrame', { configurable: true, value: () => 1 });
  try {
    let pressed = new Set([8]);
    const actions: string[] = [];
    const view = {
      destroyed: false, frame: 0, previousButtons: new Set([8]), model: { index: 2 },
      gamepadButtons: () => pressed,
      turn: (page: number) => { actions.push(`page:${page}`); },
      moveFocus: (direction: number) => { actions.push(`focus:${direction}`); },
      close: () => { actions.push('close'); view.destroyed = true; },
    };
    const poll = Reflect.get(MemoryVaultView.prototype, 'pollGamepad') as (this: typeof view) => void;
    poll.call(view);
    assert.deepEqual(actions, []);
    pressed = new Set([5]); poll.call(view); poll.call(view);
    pressed = new Set([4]); poll.call(view);
    pressed = new Set([12]); poll.call(view);
    pressed = new Set([1]); poll.call(view); poll.call(view);
    assert.deepEqual(actions, ['page:3', 'page:1', 'focus:-1', 'close']);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'requestAnimationFrame', descriptor);
    else Reflect.deleteProperty(globalThis, 'requestAnimationFrame');
  }
});

check('every door and exit has satisfiable flag dependencies', () => {
  for (const level of levels) {
    const flags = new Set(level.plates.map((plate) => plate.flag));
    for (let pass = 0; pass < level.switches.length; pass += 1) {
      for (const lever of level.switches) {
        if ((lever.requiresFlags ?? []).every((flag) => flags.has(flag))) {
          flags.add(lever.flag);
          lever.latchesFlags?.forEach((flag) => flags.add(flag));
        }
      }
    }
    for (const flag of [...level.doors.flatMap((door) => door.requiresFlags), ...(level.requiredExitFlags ?? [])]) {
      assert.ok(flags.has(flag), `${level.id}: ${flag} cannot be activated`);
    }
    const ids = [...level.platforms, ...level.timelineBlocks, ...level.plates, ...level.doors, ...level.switches, ...level.checkpoints, ...level.enemies, ...(level.hazards ?? []), ...(level.memoryFragments ?? []), ...level.storyZones].map((object) => object.id);
    assert.equal(new Set(ids).size, ids.length, `${level.id}: duplicate object ID`);
  }
});

check('every checkpoint and spawn lands on permanent ground outside hazards', () => {
  for (const level of levels) {
    for (const point of [level.spawn, ...level.checkpoints.map((checkpoint) => ({ ...checkpoint, y: checkpoint.y - 24 }))]) {
      const support = level.platforms.find((platform) => point.x - 12 >= platform.x - platform.width / 2 && point.x + 12 <= platform.x + platform.width / 2 && platform.y - platform.height / 2 >= point.y + 20 && platform.y - platform.height / 2 <= point.y + 150);
      assert.ok(support, `${level.id}: unsafe spawn ${point.x}, ${point.y}`);
      const feet = support.y - support.height / 2;
      for (const enemy of level.enemies) {
        if (Math.abs(enemy.y - feet) < 100) {
          assert.ok(point.x < enemy.patrolMinX - 50 || point.x > enemy.patrolMaxX + 50, `${level.id}: checkpoint is inside ${enemy.id}'s patrol`);
        }
      }
      for (const hazard of level.hazards ?? []) {
        const intersects = point.x + 12 > hazard.x - hazard.width / 2 && point.x - 12 < hazard.x + hazard.width / 2 && feet > hazard.y - hazard.height / 2 && feet - 44 < hazard.y + hazard.height / 2;
        assert.ok(!intersects, `${level.id}: checkpoint overlaps ${hazard.id}`);
      }
    }
  }
});

check('checkpoint spawn bodies never begin inside a ceiling or a closed gate', () => {
  for (const level of levels) {
    for (const checkpoint of level.checkpoints) {
      const point = new CheckpointSystem(level, 'present', checkpoint.id).rewindSpawn();
      const obstacles = [...level.platforms, ...level.timelineBlocks.filter((block) => Object.values(block.states).some((state) => state.solid)), ...level.doors];
      for (const obstacle of obstacles) {
        const overlaps = point.x + 12 > obstacle.x - obstacle.width / 2 && point.x - 12 < obstacle.x + obstacle.width / 2
          && point.y + 41 > obstacle.y - obstacle.height / 2 && point.y - 4 < obstacle.y + obstacle.height / 2;
        assert.ok(!overlaps, `${checkpoint.id}: spawn intersects ${obstacle.id}`);
      }
    }
  }
});

check('every switch has nearby solid support in its own timeline', () => {
  for (const level of levels) {
    for (const lever of level.switches) {
      const timelines: TimelineKey[] = lever.timelines ?? ['past', 'present', 'future'];
      for (const timeline of timelines) {
        const support = [...level.platforms, ...level.timelineBlocks.filter((block) => block.states[timeline].solid)].some((platform) => {
          const top = platform.y - platform.height / 2;
          return Math.abs(lever.x - platform.x) <= platform.width / 2 + 24 && top >= lever.y - 20 && top <= lever.y + 90;
        });
        assert.ok(support, `${level.id}: ${lever.id} has no ${timeline} support`);
      }
    }
  }
});

check('new act geometry has a jump route to each exit', () => {
  for (const level of levels.filter((entry) => ['hourglass-hotel', 'unsaid-archive', 'crownline-rooftops', 'core-reliquary'].includes(entry.id))) {
    // A geometric reachability check, not a substitute for collision and input playtesting.
    const surfaces = [...level.platforms, ...level.timelineBlocks].map((platform) => ({ ...platform, top: platform.y - platform.height / 2 }));
    const reachable = new Set(surfaces.filter((surface) => Math.abs(level.spawn.x - surface.x) < surface.width / 2 && surface.top > level.spawn.y).map((surface) => surface.id));
    for (let pass = 0; pass < surfaces.length; pass += 1) {
      for (const from of surfaces.filter((surface) => reachable.has(surface.id))) {
        for (const to of surfaces) {
          const rise = from.top - to.top;
          if (rise > 88) continue;
          const duration = (435 + Math.sqrt(435 ** 2 - 2 * 980 * rise)) / 980;
          const gap = Math.max(0, Math.abs(from.x - to.x) - from.width / 2 - to.width / 2);
          if (gap + 24 <= 246 * duration) reachable.add(to.id);
        }
      }
    }
    assert.ok(surfaces.some((surface) => reachable.has(surface.id) && Math.abs(surface.x - level.exit.x) < surface.width / 2 && Math.abs(surface.top - (level.exit.y + level.exit.height / 2)) < 70), `${level.id}: exit is outside jump range`);
  }
});

check('legacy saves load, and invalid levels and checkpoint IDs recover safely', () => {
  storage.set(key, JSON.stringify({ hasContinue: true, currentLevelId: 'level-2', timeline: 'future' }));
  assert.equal(new SaveManager().getState().currentLevelId, 'level-2');
  storage.clear();
  storage.set(key, JSON.stringify({ hasContinue: true, currentLevelId: 'missing', checkpointId: 'gone', timeline: 'yesterday' }));
  const save = new SaveManager().getState();
  assert.equal(save.currentLevelId, 'tutorial');
  assert.equal(save.checkpointId, undefined);
  assert.equal(save.timeline, 'present');
});

check('save round trips preserve puzzle state, checkpoint timeline and memories', () => {
  storage.clear();
  const save = new SaveManager();
  save.startNew();
  save.saveProgress('unsaid-archive', 'future', 'archive-reading-room', {
    latchedFlags: ['archive_record', 'archive_testimony'], seenStoryIds: ['archive-truth'], checkpointTimeline: 'present',
  });
  save.markMemoryCollected('reactor-daughter-sketch');
  save.markMemoryCollected('reactor-daughter-sketch');
  const restored = new SaveManager().getState();
  assert.deepEqual(restored.progression.levelFlags['unsaid-archive'], ['archive_record', 'archive_testimony']);
  assert.equal(restored.progression.checkpointTimeline, 'present');
  assert.deepEqual(restored.progression.collectedMemoryFragmentIds, ['reactor-daughter-sketch']);
  restored.progression.levelFlags['unsaid-archive'].push('bad');
  assert.ok(!save.getLevelFlags('unsaid-archive').includes('bad'));
});

check('failed saves preserve the last disk save and report errors until a successful retry', () => {
  const save = new SaveManager();
  save.startNew();
  const diskSave = storage.get('chrono-crawler.save.v2');
  const changes: string[] = [];
  const unsubscribe = save.onPersistenceChange((status) => changes.push(status));
  storageWriteFails = true;
  save.markMemoryCollected('rain-lamp-letter');
  save.saveProgress('level-2', 'past');
  assert.equal(save.getPersistenceStatus(), 'error');
  assert.equal(save.getContinueSummary()?.savedAtLabel, 'Not saved to disk');
  assert.deepEqual(changes, ['error']);
  assert.equal(storage.get('chrono-crawler.save.v2'), diskSave);
  assert.ok(save.isMemoryCollected('rain-lamp-letter'));
  storageWriteFails = false;
  save.saveProgress('level-2', 'past');
  assert.equal(save.getPersistenceStatus(), 'ready');
  assert.deepEqual(changes, ['error', 'ready']);
  assert.ok(new SaveManager().isMemoryCollected('rain-lamp-letter'));
  unsubscribe();
  storageWriteFails = true;
  save.saveProgress('level-2', 'future');
  assert.deepEqual(changes, ['error', 'ready']);
});

check('denied storage reads recover to a session state without claiming persistence is available', () => {
  storageReadFails = true;
  const save = new SaveManager();
  assert.equal(save.getPersistenceStatus(), 'error');
  assert.equal(save.getState().currentLevelId, 'tutorial');
  storageWriteFails = true;
  assert.doesNotThrow(() => save.startNew());
  assert.equal(save.getPersistenceStatus(), 'error');
});

check('focus loss pauses on blur or hidden state, never resumes automatically, and removes listeners', () => {
  const browserWindow = new EventTarget();
  const browserDocument = Object.assign(new EventTarget(), { hidden: false });
  let suspended = 0;
  const stop = watchFocusLoss(browserWindow, browserDocument, () => { suspended += 1; });
  browserWindow.dispatchEvent(new Event('blur'));
  assert.equal(suspended, 1);
  browserDocument.hidden = true;
  browserDocument.dispatchEvent(new Event('visibilitychange'));
  assert.equal(suspended, 2);
  browserDocument.hidden = false;
  browserDocument.dispatchEvent(new Event('visibilitychange'));
  browserWindow.dispatchEvent(new Event('focus'));
  assert.equal(suspended, 2);
  stop();
  browserWindow.dispatchEvent(new Event('blur'));
  browserDocument.hidden = true;
  browserDocument.dispatchEvent(new Event('visibilitychange'));
  assert.equal(suspended, 2);
});

check('a level opened while hidden starts suspended and restart creates only one focus watcher', () => {
  const browserWindow = new EventTarget();
  const browserDocument = Object.assign(new EventTarget(), { hidden: true });
  let suspended = 0;
  const stopFirst = watchFocusLoss(browserWindow, browserDocument, () => { suspended += 1; });
  assert.equal(suspended, 1);
  stopFirst();
  const stopSecond = watchFocusLoss(browserWindow, browserDocument, () => { suspended += 1; });
  assert.equal(suspended, 2);
  browserWindow.dispatchEvent(new Event('blur'));
  assert.equal(suspended, 3);
  stopSecond();
});

check('malformed progress is sanitized without dropping a valid legacy save', () => {
  storage.set(key, JSON.stringify({ hasContinue: true, currentLevelId: 'boss', timeline: 'past', progress: { latchedFlags: ['anchor_past', 12, 'no_such_flag', 'anchor_present'], seenStoryIds: 'bad' }, collectedMemoryIds: ['unknown'] }));
  const save = new SaveManager().getState();
  assert.equal(save.currentLevelId, 'boss');
  assert.deepEqual(save.progression.levelFlags.boss, ['anchor_past', 'anchor_present']);
  assert.deepEqual(save.progression.levelStoryIds.boss, []);
  assert.deepEqual(save.progression.collectedMemoryFragmentIds, []);
});

check('changing stage separates local puzzles and preserves memories', () => {
  storage.clear();
  const save = new SaveManager();
  save.saveProgress('unsaid-archive', 'future', undefined, { latchedFlags: ['archive_release'], seenStoryIds: [] });
  save.markMemoryCollected('archive-unsent-letter');
  save.saveProgress('crownline-rooftops', 'past');
  assert.deepEqual(save.getLevelFlags('crownline-rooftops'), []);
  assert.deepEqual(save.getLevelFlags('unsaid-archive'), ['archive_release']);
  assert.deepEqual(save.getProgression().collectedMemoryFragmentIds, ['archive-unsent-letter']);
});

check('completion persists and a new journey resets progress while keeping settings', () => {
  storage.clear();
  const save = new SaveManager();
  save.updateSettings({ reducedMotion: true, textScale: 1.2 });
  save.saveProgress('boss', 'future');
  save.markLevelCompleted('boss');
  const restored = new SaveManager();
  assert.ok(restored.getProgression().completedLevelIds.includes('boss'));
  assert.equal(restored.getContinueSummary()?.checkpointLabel, 'Journey complete');
  restored.startNew();
  assert.deepEqual(restored.getProgression().completedLevelIds, []);
  assert.equal(restored.getState().currentLevelId, 'tutorial');
  assert.deepEqual(restored.getProgression().collectedMemoryFragmentIds, []);
  assert.equal(restored.getSettings().reducedMotion, true);
});

check('checkpoint rewind uses stable geometry and original activation timeline', () => {
  const system = new CheckpointSystem(getLevel('hourglass-hotel'), 'past', 'hotel-mezzanine');
  assert.deepEqual(system.rewindSpawn(), { x: 1130, y: 816 });
  assert.equal(system.checkpointTimeline, 'past');
  assert.equal(system.checkpointLabel(), 'Checkpoint: Mezzanine');
});

check('final gate rejects missing anchors and only completes once', () => {
  const flow = new LevelFlowSystem(getLevel('boss'));
  assert.equal(flow.attemptExit(new Set(['anchor_future']), 3000).status, 'blocked');
  const all = new Set(['anchor_past', 'anchor_present', 'anchor_future']);
  assert.equal(flow.attemptExit(all, 3100).status, 'complete');
  assert.equal(flow.attemptExit(all, 3200).status, 'already-complete');
});

check('echo uses simulation time and retains the last held plate when stopped', () => {
  const recorder = new GhostRecorder();
  recorder.start();
  recorder.capture(340, 620, false, false, 'past', ['plate'], 100);
  assert.equal(recorder.elapsed, 100);
  // Paused frames never call capture: wall-clock time cannot consume the recording.
  assert.equal(recorder.progress, 100 / 8000);
  recorder.capture(340, 620, false, false, 'past', ['plate'], 100);
  const frames = recorder.stop();
  assert.equal(frames.at(-1)?.t, 200);
  assert.deepEqual(frames.at(-1)?.heldPlateFlags, ['plate']);
  assert.equal(recorder.isRecording, false);
  recorder.start();
  assert.equal(recorder.elapsed, 0);
  const automatic = recorder.capture(340, 620, false, false, 'past', ['plate'], 8100);
  assert.equal(automatic?.at(-1)?.t, 8000);
  assert.equal(recorder.isRecording, false);
});

console.log(`${passed} system checks passed.`);
