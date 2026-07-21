import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, enterPlayableTutorial } from './support/playable';

test('saves current progress from the pause menu', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await enterPlayableTutorial(page);

  await page.keyboard.press('Escape');
  await expect(page.locator('[data-pause-save-summary]')).toContainText('The Folded Reactor');
  await expect(page.locator('[data-pause-save-summary]')).toContainText('Present');

  await page.locator('[data-action="save"]').click();
  await expect(page.locator('.toast')).toHaveText('Progress saved.');

  await page.locator('[data-action="menu"]').click();
  await expect(page.locator('[data-action="continue"]')).toBeEnabled();
  await expect(page.locator('[data-continue-summary]')).toContainText('The Folded Reactor');
  expect(runtimeErrors).toEqual([]);
});
