import { test, expect } from '@playwright/test';

test.describe('Layout and Global Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.locator('input[type="email"]').fill('admin@airport.dev');
    await page.locator('input[type="password"]').fill('admin123456');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('aside')).toBeVisible();
  });

  test('should toggle sidebar collision', async ({ page }) => {
    const sidebar = page.locator('aside');
    const toggleBtn = page.locator('header button:has(svg.lucide-menu)');
    
    const initialWidth = await sidebar.evaluate(el => el.clientWidth);
    await toggleBtn.click();
    const newWidth = await sidebar.evaluate(el => el.clientWidth);
    expect(newWidth).not.toBe(initialWidth);

    await toggleBtn.click();
    const finalWidth = await sidebar.evaluate(el => el.clientWidth);
    expect(finalWidth).toBe(initialWidth);
  });

  test('should navigate to all sections from sidebar', async ({ page }) => {
    const sidebar = page.locator('aside');
    const toggleBtn = page.locator('header button:has(svg.lucide-menu)');
    
    // Ensure expanded
    if (await sidebar.evaluate(el => el.clientWidth < 100)) {
      await toggleBtn.click();
    }

    const navItems = [
      { id: 'providers', labels: [/Providers/, /提供商管理/] },
      { id: 'nodes', labels: [/Nodes/, /节点管理/] },
      { id: 'plans', labels: [/Plans/, /套餐与订阅/] },
      { id: 'tickets', labels: [/Tickets/, /工单支持/] },
      { id: 'alerts', labels: [/Alerts/, /告警配置/] },
      { id: 'users', labels: [/Users/, /用户管理/] },
      { id: 'audit', labels: [/Audit/, /审计日志/] },
    ];

    for (const item of navItems) {
      const selector = item.labels.map(l => `aside nav button:has-text("${l.source}")`).join(', ');
      await page.locator(selector).first().click();
    }
  });

  test('should toggle language', async ({ page }) => {
    const langBtn = page.locator('header button:has(svg.lucide-languages)');
    const sidebar = page.locator('aside');
    const toggleBtn = page.locator('header button:has(svg.lucide-menu)');
    
    // Ensure expanded
    if (await sidebar.evaluate(el => el.clientWidth < 100)) {
      await toggleBtn.click();
    }

    const isChinese = await page.locator('aside').getByText('仪表盘').isVisible();
    await langBtn.click();
    
    if (isChinese) {
      await expect(page.locator('aside')).toContainText('Dashboard');
    } else {
      await expect(page.locator('aside')).toContainText('仪表盘');
    }
  });

  test('should toggle dark mode', async ({ page }) => {
    const themeBtn = page.locator('header button:has(svg.lucide-sun), header button:has(svg.lucide-moon)');
    const html = page.locator('html');
    
    const isInitiallyDark = await html.evaluate(el => el.classList.contains('dark'));
    await themeBtn.click();
    const isNowDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(isNowDark).toBe(!isInitiallyDark);

    await themeBtn.click();
    const isBackToInitial = await html.evaluate(el => el.classList.contains('dark'));
    expect(isBackToInitial).toBe(isInitiallyDark);
  });
});
