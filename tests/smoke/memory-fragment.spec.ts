import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, dismissDialogue, focusPlayfield, seedContinueSave } from './support/playable';

test('opens the Folded Paper artifact when Elias collects the first memory fragment', async ({ page }) => {
  test.setTimeout(60_000);
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
    const artifact = page.locator('[data-memory-artifact]');
    await expect(artifact).toBeVisible({ timeout: 35_000 });
    await expect(artifact).toContainText('Folded Paper');
    await expect(artifact.locator('img')).toHaveAttribute('src', /folded-paper\.svg/);
    await expect(artifact.locator('img')).toHaveAttribute('alt', /You said soon/i);
  } finally {
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.up('Shift');
  }

  await page.keyboard.press('Enter');
  await expect(page.locator('[data-memory-artifact]')).toHaveCount(0);
  expect(runtimeErrors).toEqual([]);
});