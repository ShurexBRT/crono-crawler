import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, dismissDialogue, focusPlayfield, seedContinueSave } from './support/playable';

test('shows an optional memory fragment when Elias reaches it', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await seedContinueSave(page, 'tutorial', 'reactor-checkpoint');

  await page.goto('/');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);

  // The checkpoint sits inside the tutorial hint zone. Let that one-shot story
  // trigger settle and dismiss it before testing the collectible interaction.
  await page.waitForTimeout(350);
  await dismissDialogue(page);
  await focusPlayfield(page);

  await page.keyboard.down('Shift');
  await page.keyboard.down('ArrowLeft');
  try {
    await expect(page.locator('.dialogue-panel')).toContainText('Memory Fragment: Folded Paper', { timeout: 25_000 });
  } finally {
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.up('Shift');
  }

  expect(runtimeErrors).toEqual([]);
});
