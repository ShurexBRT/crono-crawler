import { mkdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, enterPlayableTutorial, focusPlayfield } from './support/playable';

test('captures the Folded Reactor production target across all timelines', async ({ page }) => {
  test.setTimeout(60_000);
  const runtimeErrors = collectRuntimeErrors(page);
  mkdirSync('artifacts/visual', { recursive: true });

  await enterPlayableTutorial(page);
  await expect(page.locator('[data-hud-shell]')).toBeVisible();
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Present');
  await page.screenshot({ path: 'artifacts/visual/folded-reactor-present.png' });

  await focusPlayfield(page);
  await page.keyboard.press('1');
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Past');
  await page.waitForTimeout(240);
  await page.screenshot({ path: 'artifacts/visual/folded-reactor-past.png' });

  await focusPlayfield(page);
  await page.keyboard.press('3');
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Ruined Future');
  await page.waitForTimeout(240);
  await page.screenshot({ path: 'artifacts/visual/folded-reactor-future.png' });

  expect(runtimeErrors).toEqual([]);
});
