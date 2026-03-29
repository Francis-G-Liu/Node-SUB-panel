import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('NodeAdmin Pro');

    await page.locator('input[type="email"]').fill('admin@airport.dev');
    await page.locator('input[type="password"]').fill('admin123456');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('aside')).toBeVisible();

    // Ensure expanded
    const sidebar = page.locator('aside');
    const toggleBtn = page.locator('header button:has(svg.lucide-menu)');
    if (await sidebar.evaluate(el => el.clientWidth < 100)) {
      await toggleBtn.click();
    }
    
    await expect(page.locator('aside')).toContainText('admin@airport.dev');
  });

  test('should logout successfully', async ({ page }) => {
    await page.locator('input[type="email"]').fill('admin@airport.dev');
    await page.locator('input[type="password"]').fill('admin123456');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('aside')).toBeVisible();

    // Ensure expanded
    const sidebar = page.locator('aside');
    const toggleBtn = page.locator('header button:has(svg.lucide-menu)');
    if (await sidebar.evaluate(el => el.clientWidth < 100)) {
      await toggleBtn.click();
    }

    const logoutTrigger = page.locator('aside button:has(svg.lucide-more-vertical)');
    await logoutTrigger.click();
    
    // Tiny wait for Radix UI animation
    await page.waitForTimeout(500);

    // Click the actual logout button in the dropdown
    const logoutBtn = page.locator('[role="menuitem"]:has-text("Logout"), [role="menuitem"]:has-text("退出登录")');
    await logoutBtn.first().click();

    await expect(page.locator('h1')).toContainText('NodeAdmin Pro');
  });
});
