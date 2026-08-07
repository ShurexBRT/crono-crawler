import { expect, test } from '@playwright/test';

test('authored level data passes structural validation', async ({ page }) => {
  await page.goto('/');

  const issues = await page.evaluate(async () => {
    const [{ levels }, { validateLevels }] = await Promise.all([
      import('/src/game/content/levels.ts'),
      import('/src/game/content/levelValidation.ts'),
    ]);
    return validateLevels(levels);
  });

  expect(issues).toEqual([]);
});
