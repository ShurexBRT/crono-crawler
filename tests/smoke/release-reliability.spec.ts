import { expect, test } from '@playwright/test';
import { dismissDialogue, enterPlayableTutorial, seedContinueSave } from './support/playable';

test('focus loss suspends gameplay until explicit resume without a stuck movement key', async ({ page }) => {
  await enterPlayableTutorial(page);
  await page.keyboard.down('ArrowRight');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('.pause-panel')).toBeVisible();
  const state = () => page.evaluate(async () => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    const scene = game.scene.getScene('GameScene');
    return { paused: scene.physics.world.isPaused, x: scene.player.sprite.x };
  });
  const before = await state();
  expect(before.paused).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.waitForTimeout(200);
  expect(await state()).toEqual(before);
  await page.keyboard.up('ArrowRight');
  await page.locator('[data-action="resume"]').click();
  await page.waitForTimeout(100);
  expect((await state()).paused).toBe(false);
  expect(Math.abs((await state()).x - before.x)).toBeLessThan(2);
});

test('focus loss preserves a story overlay and requires resume after the story closes', async ({ page }) => {
  await seedContinueSave(page, 'tutorial');
  await page.goto('/');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('.dialogue-panel')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('.dialogue-panel')).toBeVisible();
  await expect(page.locator('.pause-panel')).toHaveCount(0);
  await dismissDialogue(page);
  await expect(page.locator('.pause-panel')).toBeVisible();
  await page.locator('[data-action="resume"]').click();
  await expect(page.locator('.pause-panel')).toHaveCount(0);
});

test('failed writes never show a successful save and retry clears the warning', async ({ page }) => {
  await enterPlayableTutorial(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Object.defineProperty(window, '__restoreTestStorage', { configurable: true, value: () => { Storage.prototype.setItem = original; } });
    Storage.prototype.setItem = () => { throw new DOMException('Test storage quota', 'QuotaExceededError'); };
  });
  await page.keyboard.press('Escape');
  await page.locator('[data-action="save"]').click();
  await expect(page.locator('[data-save-error]')).toBeVisible();
  await expect(page.locator('.toast')).toContainText('Saving failed');
  await expect(page.locator('[data-pause-save-summary]')).toContainText('Not saved to disk');
  await page.evaluate(() => {
    (window as unknown as { __restoreTestStorage: () => void }).__restoreTestStorage();
  });
  await page.locator('[data-action="save"]').click();
  await expect(page.locator('[data-save-error]')).toBeHidden();
  await expect(page.locator('.toast')).toHaveText('Progress saved.');
});
