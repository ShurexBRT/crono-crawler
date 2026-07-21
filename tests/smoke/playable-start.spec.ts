import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, enterPlayableTutorial } from './support/playable';

test('boots from title screen into the playable tutorial', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await enterPlayableTutorial(page);

  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(350);
  await page.keyboard.up('ArrowRight');

  const canvasBounds = await page.locator('canvas').boundingBox();
  expect(canvasBounds?.width).toBeGreaterThan(500);
  expect(canvasBounds?.height).toBeGreaterThan(300);
  expect(runtimeErrors).toEqual([]);
});
