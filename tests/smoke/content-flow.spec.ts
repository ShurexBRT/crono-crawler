import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, dismissDialogue, seedContinueSave } from './support/playable';

test('loads the Rain District Crossing content from continue data', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await seedContinueSave(page, 'rain-crossing');

  await page.goto('/');
  await expect(page.locator('[data-action="continue"]')).toBeEnabled();
  await expect(page.locator('[data-continue-summary]')).toContainText('Rain District Crossing');
  await expect(page.locator('[data-continue-summary]')).toContainText('Present');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);

  await expect(page.locator('.level-chip')).toContainText('Rain District Crossing');
  await expect(page.locator('[data-hud="objective"]')).toHaveText('Hold the old street open. Cross through the ruined hour.');
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Present');
  expect(runtimeErrors).toEqual([]);
});
