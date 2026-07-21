import { expect, type Page, test } from '@playwright/test';

test('boots from title screen into the playable tutorial', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      runtimeErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) {
      runtimeErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto('/');

  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('[data-action="new"]')).toBeVisible();
  await expect(page.locator('[data-action="continue"]')).toBeDisabled();

  await page.locator('[data-action="new"]').click();
  await expect(page.locator('[data-action="intro-skip"]')).toBeVisible();
  await page.locator('[data-action="intro-skip"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);
  await expect(page.locator('.overlay-layer')).not.toHaveClass(/is-active/);

  await expect(page.locator('[data-hud="timeline"]')).toBeVisible();
  await expect(page.locator('[data-hud="objective"]')).toBeVisible();
  await expect(page.locator('[data-hud="ghost"]')).toHaveText('Ready');
  await expect(page.locator('[data-hud="timeline"]')).toHaveText('Present');
  await page.locator('canvas').click({ position: { x: 640, y: 360 } });

  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(350);
  await page.keyboard.up('ArrowRight');

  const canvasBounds = await page.locator('canvas').boundingBox();
  expect(canvasBounds?.width).toBeGreaterThan(500);
  expect(canvasBounds?.height).toBeGreaterThan(300);
  expect(runtimeErrors).toEqual([]);
});

async function dismissDialogue(page: Page): Promise<void> {
  for (let index = 0; index < 8; index += 1) {
    const nextButton = page.locator('[data-action="next"]');
    if ((await nextButton.count()) === 0) {
      return;
    }
    await nextButton.click();
    await page.waitForTimeout(100);
  }
}
