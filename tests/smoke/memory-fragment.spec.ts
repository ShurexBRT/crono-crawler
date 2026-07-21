import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, dismissDialogue, seedContinueSave } from './support/playable';

test('shows an optional memory fragment when Elias reaches it', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await seedContinueSave(page, 'tutorial');

  await page.goto('/');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);

  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(2800);
  await page.keyboard.up('ArrowRight');

  await expect(page.locator('.dialogue-panel')).toContainText('Memory Fragment: Folded Paper');
  expect(runtimeErrors).toEqual([]);
});
