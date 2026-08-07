import { expect, test } from '@playwright/test';

test('plays the ending sequence and can skip safely to the epilogue', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(async () => {
    const { EndingSequenceView } = await import('/src/ui/EndingSequenceView.ts');
    const audio = { playSfx: () => undefined };
    const ending = new EndingSequenceView(audio as never);
    ending.show(() => {
      document.body.dataset.endingComplete = 'true';
    });
  });

  await expect(page.locator('[data-ending-beat="keeper-reveal"]')).toBeVisible();
  await expect(page.locator('.ending-card')).toContainText('The Keeper removes his mask.');

  await page.keyboard.press('Escape');
  await expect(page.locator('[data-ending-beat="epilogue-card"]')).toBeVisible();
  await expect(page.locator('.ending-card')).toContainText('Tomorrow, imperfectly.');

  await page.locator('[data-action="ending-next"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-ending-complete', 'true');
});
