import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, dismissDialogue, enterPlayableTutorial } from './support/playable';

test('cycles timelines from gameplay keyboard input', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await enterPlayableTutorial(page);

  await page.keyboard.press('q');
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Ruined Future');

  await page.keyboard.press('q');
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Past');

  await page.keyboard.press('q');
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Present');
  expect(runtimeErrors).toEqual([]);
});

test('selects timelines from direct number hotkeys', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await enterPlayableTutorial(page);

  await page.keyboard.press('1');
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Past');

  await page.keyboard.press('2');
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Present');

  await page.keyboard.press('3');
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Ruined Future');
  expect(runtimeErrors).toEqual([]);
});

test('does not replay blocked timeline input after dialogue closes', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto('/');
  await expect(page.locator('[data-action="new"]')).toBeVisible();
  await page.locator('[data-action="new"]').click();
  await expect(page.locator('[data-action="intro-skip"]')).toBeVisible();
  await page.locator('[data-action="intro-skip"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();

  await page.keyboard.press('q');
  await dismissDialogue(page);

  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Present');
  expect(runtimeErrors).toEqual([]);
});
