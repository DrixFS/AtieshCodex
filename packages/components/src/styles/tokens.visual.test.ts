import { test, expect } from '@playwright/test';

test.describe('Design Tokens Visual Regression', () => {
  test('renders design token color swatches and radii correctly', async ({ page }) => {
    await page.goto('/iframe.html?id=design-system-design-tokens--tokens&viewMode=story');
    const title = page.locator('h1', { hasText: 'Atiesh Codex — Design Tokens' });
    await expect(title).toBeVisible();
    await expect(page).toHaveScreenshot('tokens-story.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
