import { expect, test } from '@playwright/test';
import { dismissDialogue, enterPlayableTutorial, seedContinueSave } from './support/playable';

test('the vault pauses gameplay and closes without replaying movement or timeline input', async ({ page }) => {
  await enterPlayableTutorial(page);
  await page.keyboard.press('KeyJ');
  await expect(page.getByRole('dialog', { name: 'Memory Vault' })).toBeVisible();
  const state = () => page.evaluate(async () => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    const scene = game.scene.getScene('GameScene');
    return { x: scene.player.sprite.x, timeline: scene.timelineManager.current, paused: scene.physics.world.isPaused };
  });
  const before = await state();
  expect(before.paused).toBe(true);
  await page.keyboard.press('Digit3');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-vault-book]')).toHaveAttribute('data-vault-entry-id', 'reactor-daughter-sketch');
  await expect(page.locator('[data-vault-art]')).toHaveCount(0);
  await page.waitForTimeout(150);
  expect(await state()).toEqual(before);
  await page.keyboard.press('KeyJ');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.waitForTimeout(100);
  const after = await state();
  expect(after.paused).toBe(false);
  expect(after.timeline).toBe(before.timeline);
  expect(Math.abs(after.x - before.x)).toBeLessThan(2);
  await page.locator('[data-action="vault-open"]').click();
  await expect(page.getByRole('dialog', { name: 'Memory Vault' })).toBeVisible();
});

test('opening the vault preserves the exact dialogue and paused menu underneath it', async ({ page }) => {
  await seedContinueSave(page, 'tutorial');
  await page.goto('/');
  await page.locator('[data-action="continue"]').click();
  const story = page.locator('.dialogue-panel p');
  await expect(story).toBeVisible();
  const line = await story.textContent();
  await page.keyboard.press('KeyJ');
  await expect(page.getByRole('dialog', { name: 'Memory Vault' })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(story).toHaveText(line!);
  await dismissDialogue(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('.pause-panel')).toBeVisible();
  await page.locator('[data-action="journal"]').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.pause-panel')).toBeVisible();
  await expect(page.locator('[data-action="journal"]')).toBeFocused();
});

test('reading persists the bookmark and focus loss inside the vault requires resume', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('chrono-crawler.save.v1', JSON.stringify({ hasContinue: true, currentLevelId: 'tutorial', collectedMemoryIds: ['rain-lamp-letter'] }));
  });
  await page.goto('/');
  await page.locator('[data-action="journal"]').click();
  await page.locator('[data-vault-entry="rain-lamp-letter"]').click();
  await expect(page.locator('[data-vault-letter]')).toContainText('Love, Mara');
  await page.reload();
  await page.locator('[data-action="journal"]').click();
  await expect(page.locator('[data-vault-book]')).toHaveAttribute('data-vault-entry-id', 'rain-lamp-letter');
  await page.keyboard.press('Escape');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('.dialogue-panel')).toBeVisible();
  await dismissDialogue(page);
  await page.keyboard.press('KeyJ');
  await expect(page.getByRole('dialog', { name: 'Memory Vault' })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.keyboard.press('Escape');
  await expect(page.locator('.pause-panel')).toBeVisible();
  await page.locator('[data-action="resume"]').click();
  await expect(page.locator('.overlay-layer')).not.toHaveClass(/is-active/);
});
