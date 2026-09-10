import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, dismissDialogue, focusPlayfield, seedContinueSave } from './support/playable';

test('shows an optional memory fragment when Elias reaches it', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await seedContinueSave(page, 'tutorial', 'reactor-checkpoint');

  await page.goto('/');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);

  // The checkpoint sits inside the tutorial hint zone. Let that one-shot story
  // trigger settle and dismiss it before testing the collectible interaction.
  await page.waitForTimeout(350);
  await dismissDialogue(page);
  await focusPlayfield(page);

  await page.keyboard.down('Shift');
  await page.keyboard.down('ArrowLeft');
  try {
    await expect(page.getByRole('dialog')).toContainText('Three Suns', { timeout: 25_000 });
  } finally {
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.up('Shift');
  }

  await expect(page.locator('[data-memory-art]')).toBeVisible();
  await expect.poll(() => page.locator('[data-memory-art]').evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const suspendedState = () => page.evaluate(async () => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    const scene = game.scene.getScene('GameScene');
    return { x: scene.player.sprite.x, y: scene.player.sprite.y, paused: scene.physics.world.isPaused, timeline: scene.timelineManager.current };
  });
  const before = await suspendedState();
  expect(before.paused).toBe(true);
  await page.keyboard.press('Digit3');
  await page.waitForTimeout(250);
  expect(await suspendedState()).toEqual(before);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.pause-panel')).toHaveCount(0);
  await page.waitForTimeout(100);
  expect((await suspendedState()).paused).toBe(false);
  expect((await suspendedState()).timeline).toBe(before.timeline);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('chrono-crawler.save.v2')!).progression.collectedMemoryFragmentIds);
  expect(saved).toContain('reactor-daughter-sketch');

  expect(runtimeErrors).toEqual([]);
});
