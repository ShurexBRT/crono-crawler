import { expect, test } from '@playwright/test';
import { dismissDialogue, enterPlayableTutorial, seedContinueSave } from './support/playable';

for (const viewport of [{ width: 1366, height: 768 }, { width: 390, height: 844 }]) {
  test(`right stick scrolls long vault letters at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => {
      const axes = [0, 0, 0, 0];
      Object.defineProperty(window, '__vaultTestAxes', { value: axes });
      Object.defineProperty(navigator, 'getGamepads', { value: () => [{ connected: true, axes, buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0, touched: false })) }] });
      localStorage.setItem('chrono-crawler.save.v1', JSON.stringify({ collectedMemoryIds: ['rain-lamp-letter'], settings: { textScale: 1.25, reducedMotion: true } }));
    });
    await page.goto('/');
    await page.locator('[data-action="journal"]').click();
    await page.locator('[data-vault-entry="rain-lamp-letter"]').click();
    const surface = page.locator(viewport.width > 860 ? '.vault-art-page' : '.vault-desk');
    await expect.poll(() => surface.evaluate((node) => node.scrollHeight - node.clientHeight)).toBeGreaterThan(60);
    await surface.evaluate((node) => { node.scrollTop = 0; });
    const setAxis = (value: number) => page.evaluate((axis) => {
      (window as unknown as { __vaultTestAxes: number[] }).__vaultTestAxes[3] = axis;
    }, value);
    await setAxis(1);
    await expect.poll(() => surface.evaluate((node) => node.scrollTop)).toBeGreaterThan(60);
    await setAxis(0);
    const stoppedAt = await surface.evaluate((node) => node.scrollTop);
    await page.waitForTimeout(100);
    expect(await surface.evaluate((node) => node.scrollTop)).toBe(stoppedAt);
    await setAxis(-1);
    await expect.poll(() => surface.evaluate((node) => node.scrollTop)).toBeLessThan(5);
    await setAxis(0);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
}

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
