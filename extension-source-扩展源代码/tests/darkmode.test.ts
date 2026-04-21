import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const EXTENSION_PATH = path.resolve(__dirname, '..');

test.describe('暗黑模式扩展测试', () => {
  test.beforeAll(async () => {
    // 确保扩展已编译
    const { execSync } = require('child_process');
    try {
      execSync('npm run build', { cwd: EXTENSION_PATH });
    } catch (e) {
      console.log('编译失败，请确保已安装依赖');
    }
  });

  test('测试页面加载和暗黑模式切换', async ({ page, context }) => {
    // 加载测试页面
    const testPagePath = path.join(EXTENSION_PATH, 'test-page', 'index.html');
    const testPageUrl = `file://${testPagePath}`;
    
    await page.goto(testPageUrl);
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 截图 - 暗黑模式关闭
    await page.screenshot({ path: 'tests/screenshots/before-darkmode.png' });
    
    // 手动注入暗黑模式（模拟扩展行为）
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'themes.js')
    });
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'content.js')
    });
    
    // 启用暗黑模式
    await page.evaluate(() => {
      document.documentElement.classList.add('dm-on');
    });
    
    // 等待样式应用
    await page.waitForTimeout(500);
    
    // 截图 - 暗黑模式开启
    await page.screenshot({ path: 'tests/screenshots/after-darkmode.png' });
    
    // 检查暗黑模式类是否添加
    const hasDarkModeClass = await page.evaluate(() => {
      return document.documentElement.classList.contains('dm-on');
    });
    expect(hasDarkModeClass).toBe(true);
    
    // 检查背景色是否改变
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('文本可读性测试', async ({ page }) => {
    const testPagePath = path.join(EXTENSION_PATH, 'test-page', 'index.html');
    await page.goto(`file://${testPagePath}`);
    
    // 注入暗黑模式
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'themes.js')
    });
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'content.js')
    });
    
    await page.evaluate(() => {
      document.documentElement.classList.add('dm-on');
    });
    await page.waitForTimeout(500);
    
    // 检查文本颜色对比度
    const textColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).color;
    });
    
    // 在暗黑模式下，文本应该是浅色的
    const isLightText = textColor === 'rgb(220, 240, 255)' || 
                       textColor === 'rgb(240, 240, 240)' ||
                       textColor.includes('240');
    expect(isLightText).toBe(true);
  });

  test('按钮可见性测试', async ({ page }) => {
    const testPagePath = path.join(EXTENSION_PATH, 'test-page', 'index.html');
    await page.goto(`file://${testPagePath}`);
    
    // 注入暗黑模式
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'themes.js')
    });
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'content.js')
    });
    
    await page.evaluate(() => {
      document.documentElement.classList.add('dm-on');
    });
    await page.waitForTimeout(500);
    
    // 检查按钮是否可见
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('图片显示测试', async ({ page }) => {
    const testPagePath = path.join(EXTENSION_PATH, 'test-page', 'index.html');
    await page.goto(`file://${testPagePath}`);
    
    // 注入暗黑模式
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'themes.js')
    });
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'content.js')
    });
    
    await page.evaluate(() => {
      document.documentElement.classList.add('dm-on');
    });
    await page.waitForTimeout(500);
    
    // 检查图片是否显示
    const images = page.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
    
    for (let i = 0; i < count; i++) {
      const image = images.nth(i);
      const isVisible = await image.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('表单元素测试', async ({ page }) => {
    const testPagePath = path.join(EXTENSION_PATH, 'test-page', 'index.html');
    await page.goto(`file://${testPagePath}`);
    
    // 注入暗黑模式
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'themes.js')
    });
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'content.js')
    });
    
    await page.evaluate(() => {
      document.documentElement.classList.add('dm-on');
    });
    await page.waitForTimeout(500);
    
    // 检查输入框
    const input = page.locator('input[type="text"]');
    await expect(input).toBeVisible();
    await input.fill('测试输入');
    const value = await input.inputValue();
    expect(value).toBe('测试输入');
    
    // 检查下拉框
    const select = page.locator('select');
    await expect(select).toBeVisible();
  });

  test('性能测试', async ({ page }) => {
    const testPagePath = path.join(EXTENSION_PATH, 'test-page', 'index.html');
    
    // 测试不加载暗黑模式的加载时间
    const start1 = Date.now();
    await page.goto(`file://${testPagePath}`);
    await page.waitForLoadState('networkidle');
    const timeWithoutDarkMode = Date.now() - start1;
    
    // 刷新页面
    await page.reload();
    
    // 注入暗黑模式
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'themes.js')
    });
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'content.js')
    });
    
    await page.evaluate(() => {
      document.documentElement.classList.add('dm-on');
    });
    await page.waitForTimeout(500);
    
    // 测试加载时间
    const start2 = Date.now();
    await page.reload();
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'themes.js')
    });
    await page.addScriptTag({
      path: path.join(EXTENSION_PATH, 'src', 'content.js')
    });
    await page.evaluate(() => {
      document.documentElement.classList.add('dm-on');
    });
    await page.waitForTimeout(500);
    const timeWithDarkMode = Date.now() - start2;
    
    console.log(`不加载暗黑模式: ${timeWithoutDarkMode}ms`);
    console.log(`加载暗黑模式: ${timeWithDarkMode}ms`);
    
    // 暗黑模式不应该显著增加加载时间（超过 500ms 认为有问题）
    const timeDiff = timeWithDarkMode - timeWithoutDarkMode;
    expect(timeDiff).toBeLessThan(500);
  });
});

// 创建截图目录
const screenshotDir = path.join(EXTENSION_PATH, 'tests', 'screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}
