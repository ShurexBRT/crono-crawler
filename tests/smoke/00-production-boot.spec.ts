import { expect, test } from '@playwright/test';
import { collectRuntimeErrors } from './support/playable';

test('production art boot reaches the main menu without runtime errors', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await page.goto('/');
  await page.waitForTimeout(1500);

  expect(runtimeErrors).toEqual([]);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('[data-action="new"]')).toBeVisible();
});
