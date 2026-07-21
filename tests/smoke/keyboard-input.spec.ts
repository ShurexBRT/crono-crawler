import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, enterPlayableTutorial } from './support/playable';

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
