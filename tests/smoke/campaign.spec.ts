import { expect, test } from '@playwright/test';
import { collectRuntimeErrors, dismissDialogue, seedContinueSave } from './support/playable';

const stages = [
  ['hourglass-hotel', 'The Hourglass Hotel'],
  ['unsaid-archive', 'Archive of Unsaid Things'],
  ['crownline-rooftops', 'Crownline Rooftops'],
  ['core-reliquary', 'The Core Reliquary'],
];

for (const [id, title] of stages) {
  test(`${title} loads with a grounded player and visible playfield`, async ({ page }, testInfo) => {
    const errors = collectRuntimeErrors(page);
    await seedContinueSave(page, id);
    await page.goto('/');
    await page.locator('[data-action="continue"]').click();
    await expect(page.locator('[data-action="next"]')).toBeVisible();
    await dismissDialogue(page);
    await expect(page.locator('.level-chip')).toContainText(title);
    await expect.poll(() => page.evaluate(async () => {
      const entry = '/src/main.ts';
      const { game } = await import(entry);
      const scene = game.scene.getScene('GameScene');
      return scene.player.sprite.body.blocked.down;
    })).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${id}.png`) });
    if (id === 'hourglass-hotel') {
      expect(await page.evaluate(async () => {
        const entry = '/src/main.ts';
        const { game } = await import(entry);
        const scene = game.scene.getScene('GameScene');
        const screenY = scene.player.sprite.y - scene.cameras.main.scrollY;
        return screenY > 120 && screenY < 690;
      })).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test('an archive switch stays solved after pause, menu and a fresh page load', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('chrono-crawler.save.v1', JSON.stringify({ hasContinue: true, currentLevelId: 'unsaid-archive', timeline: 'past' })));
  await page.reload();
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);
  // Position the save fixture at the switch; activation still goes through gameplay input.
  await page.evaluate(async () => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    game.scene.getScene('GameScene').player.respawn({ x: 430, y: 610 });
  });
  await page.waitForTimeout(250);
  await page.keyboard.press('e');
  await expect(page.locator('[data-hud="objective"]')).toContainText('[+] Past record');
  await page.keyboard.press('p');
  await page.locator('[data-action="save"]').click();
  await page.locator('[data-action="menu"]').click();
  await page.reload();
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('[data-action="next"]')).toBeVisible();
  await dismissDialogue(page);
  await expect(page.locator('[data-hud="objective"]')).toContainText('[+] Past record');
  expect(await page.evaluate(async () => {
    const entry = '/src/main.ts';
    const { game } = await import(entry);
    return game.scene.getScene('GameScene').doors.find((door: { id: string }) => door.id === 'archive-index-door').rectangle.body.enable;
  })).toBe(false);
  expect(errors).toEqual([]);
});

test('a completed journey reopens the interactive epilogue and returns to the menu', async ({ page }, testInfo) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('chrono-crawler.save.v1', JSON.stringify({ hasContinue: true, currentLevelId: 'boss', timeline: 'future', completed: true, collectedMemoryIds: ['reactor-daughter-sketch'] })));
  await page.reload();
  await expect(page.locator('[data-continue-summary]')).toContainText('Journey complete');
  await page.locator('[data-action="continue"]').click();
  await expect(page.locator('.ending-sequence')).toHaveAttribute('data-ending-beat', 'keeper-reveal');
  await page.locator('[data-action="ending-next"]').click();
  await expect(page.locator('.ending-sequence')).toHaveAttribute('data-ending-beat', 'mara-truth');
  await page.locator('[data-action="ending-next"]').click();
  await expect(page.locator('[data-action="ending-next"]')).toHaveText('No More Corrections');
  await page.locator('[data-action="ending-skip"]').click();
  await expect(page.locator('[data-ending-memories]')).toHaveText('Memories recovered: 1 / 9');
  await page.screenshot({ path: testInfo.outputPath('epilogue-desktop.png') });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('[data-action="ending-next"]')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('epilogue-small-landscape.png') });
  await page.locator('[data-action="ending-next"]').click();
  await expect(page.locator('[data-action="new"]')).toBeVisible();
  expect(errors).toEqual([]);
});
