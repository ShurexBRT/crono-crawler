import { expect, test } from '@playwright/test';
import { collectRuntimeErrors } from './support/playable';

test('applies accessibility settings from the options menu', async ({ page }) => {
  const runtimeErrors = collectRuntimeErrors(page);
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto('/');
  await page.locator('[data-action="options"]').click();

  const textScale = page.locator('[data-setting="text-scale"]');
  const reducedMotion = page.locator('[data-setting="reduced-motion"]');
  const reducedFlashes = page.locator('[data-setting="reduced-flashes"]');

  await expect(textScale).toBeVisible();
  await expect(reducedMotion).toBeVisible();
  await expect(reducedFlashes).toBeVisible();

  await textScale.fill('1.25');
  await expect(page.locator('html')).toHaveCSS('--text-scale', '1.25');

  await reducedMotion.check();
  await reducedFlashes.check();

  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-reduced-flashes', 'true');
  expect(runtimeErrors).toEqual([]);
});
