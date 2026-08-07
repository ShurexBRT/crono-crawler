import { expect, test } from '@playwright/test';

test('migrates legacy v1 saves and persists richer progression state', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem(
      'chrono-crawler.save.v1',
      JSON.stringify({
        hasContinue: true,
        currentLevelId: 'level-2',
        checkpointId: 'greenhouse-checkpoint',
        timeline: 'future',
        updatedAt: 1_700_000_000_000,
        settings: {
          musicVolume: 0.25,
          sfxVolume: 0.5,
          fullscreen: false,
          textScale: 1.15,
          reducedMotion: true,
          reducedFlashes: true,
        },
      }),
    );
  });

  await page.goto('/');
  await expect(page.locator('[data-action="continue"]')).toBeEnabled();
  await expect(page.locator('[data-continue-summary]')).toContainText('Glasshouse Station');

  const result = await page.evaluate(async () => {
    const { SaveManager } = await import('/src/game/systems/SaveManager.ts');
    const save = new SaveManager();

    save.saveLevelFlags('level-2', ['station_switch']);
    save.markMemoryCollected('market-photo-strip');
    save.markLevelCompleted('tutorial');
    save.completeRun();

    return {
      state: save.getState(),
      persisted: JSON.parse(window.localStorage.getItem('chrono-crawler.save.v2') ?? '{}'),
    };
  });

  expect(result.state.version).toBe(2);
  expect(result.state.currentLevelId).toBe('level-2');
  expect(result.state.checkpointId).toBeUndefined();
  expect(result.state.timeline).toBe('future');
  expect(result.state.hasContinue).toBe(false);
  expect(result.state.settings.reducedMotion).toBe(true);
  expect(result.state.progression.levelFlags['level-2']).toEqual(['station_switch']);
  expect(result.state.progression.collectedMemoryFragmentIds).toContain('market-photo-strip');
  expect(result.state.progression.completedLevelIds).toContain('tutorial');
  expect(result.state.progression.endingSeen).toBe(true);
  expect(result.persisted.version).toBe(2);
  expect(result.persisted.hasContinue).toBe(false);
});
