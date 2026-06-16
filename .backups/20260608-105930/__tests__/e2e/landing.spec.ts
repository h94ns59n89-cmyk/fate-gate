import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the landing page with title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('命理人格');
  });

  test('should show birth form on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[type="date"]')).toBeVisible();
  });

  test('should navigate through the flow', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="date"]', '1990-08-15');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=正在排盘计算')).toBeVisible();
  });
});
