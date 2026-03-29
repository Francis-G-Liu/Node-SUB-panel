import { test, expect } from '@playwright/test';

test.describe('Management Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
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
  });

  test('should open and close Add Provider modal', async ({ page }) => {
    await page.locator('aside nav button:has-text("Providers"), aside nav button:has-text("提供商管理")').first().click();
    
    // Add Provider (en) or 添加提供商 (zh)
    const addBtn = page.locator('button:has-text("Add Provider"), button:has-text("添加提供商")');
    await addBtn.first().click();
    
    // Check for modal presence by title
    await expect(page.locator('h3').first()).toContainText(/Add Provider|添加提供商/);
    
    // Cancel
    await page.locator('button:has-text("Cancel"), button:has-text("取消")').first().click();
    await expect(page.locator('h3').filter({ hasText: /Add Provider|添加提供商/ })).not.toBeVisible();
  });

  test('should open and close Create New Plan modal', async ({ page }) => {
    await page.locator('aside nav button:has-text("Plans"), aside nav button:has-text("套餐与订阅")').first().click();
    
    // Create New Plan (en) or 创建新套餐 (zh)
    const addBtn = page.locator('button:has-text("Create New Plan"), button:has-text("创建新套餐")');
    await addBtn.first().click();
    
    // Check for modal presence by title
    await expect(page.locator('h3').first()).toContainText(/Create New Plan|创建新套餐/);
    
    // Cancel
    await page.locator('button:has-text("Cancel"), button:has-text("取消")').first().click();
    await expect(page.locator('h3').filter({ hasText: /Create New Plan|创建新套餐/ })).not.toBeVisible();
  });

  test('should open and close Add User modal', async ({ page }) => {
    await page.locator('aside nav button:has-text("Users"), aside nav button:has-text("用户管理")').first().click();
    
    // Add User (en) or 添加用户 (zh)
    const addBtn = page.locator('button:has-text("Add User"), button:has-text("添加用户")');
    await addBtn.first().click();
    
    // Check for modal presence by title
    await expect(page.locator('h3').first()).toContainText(/Add User|添加用户/);
    
    // Cancel
    await page.locator('button:has-text("Cancel"), button:has-text("取消")').first().click();
    await expect(page.locator('h3').filter({ hasText: /Add User|添加用户/ })).not.toBeVisible();
  });

  test('should trigger refresh on dashboard', async ({ page }) => {
    await page.locator('aside nav button:has-text("Dashboard"), aside nav button:has-text("仪表盘")').first().click();
    
    const refreshBtn = page.locator('header button:has(svg.lucide-refresh-cw)');
    if (await refreshBtn.isVisible()) {
      await refreshBtn.click();
    }
  });
});
