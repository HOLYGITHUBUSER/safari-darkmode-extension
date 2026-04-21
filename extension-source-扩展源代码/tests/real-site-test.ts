import { chromium, Browser, Page, BrowserContext } from 'playwright';
import path from 'path';
import fs from 'fs';
import { chinaSites } from './sites/china-sites';

const EXTENSION_PATH = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(EXTENSION_PATH, 'tests', 'screenshots', 'china-sites');

// 创建截图目录
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function testSite(site: { name: string; url: string; category: string }) {
  console.log(`\n测试 ${site.name} (${site.url})...`);
  
  const browser: Browser = await chromium.launch({ headless: false });
  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page: Page = await context.newPage();
  
  try {
    // 访问网站
    await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // 等待页面完全加载
    
    // 截图 - 暗黑模式关闭
    const beforePath = path.join(SCREENSHOT_DIR, `${site.name}-before.png`);
    await page.screenshot({ path: beforePath, fullPage: false });
    console.log(`  ✓ 保存截图: ${site.name}-before.png`);
    
    // 注入暗黑模式脚本
    const themesPath = path.join(EXTENSION_PATH, 'src', 'themes.js');
    const contentPath = path.join(EXTENSION_PATH, 'src', 'content.js');
    
    // 检查编译后的文件是否存在
    if (!fs.existsSync(themesPath) || !fs.existsSync(contentPath)) {
      console.log(`  ⚠ 编译后的 JS 文件不存在，请先运行 npm run build`);
      await browser.close();
      return;
    }
    
    // 注入脚本
    await page.addScriptTag({ path: themesPath });
    await page.addScriptTag({ path: contentPath });
    
    // 模拟 chrome.storage
    await page.evaluate(() => {
      (window as any).chrome = {
        storage: {
          local: {
            get: (keys: any, callback?: any) => {
              const result = {
                enabled: true,
                theme: 'dark',
                brightness: 100,
                contrast: 100,
                whitelist: []
              };
              if (callback) callback(result);
              return Promise.resolve(result);
            },
            set: (items: any, callback?: any) => {
              if (callback) callback();
              return Promise.resolve();
            }
          }
        }
      };
    });
    
    // 启用暗黑模式
    await page.evaluate(() => {
      document.documentElement.classList.add('dm-on');
    });
    
    await page.waitForTimeout(1000); // 等待样式应用
    
    // 截图 - 暗黑模式开启
    const afterPath = path.join(SCREENSHOT_DIR, `${site.name}-after.png`);
    await page.screenshot({ path: afterPath, fullPage: false });
    console.log(`  ✓ 保存截图: ${site.name}-after.png`);
    
    console.log(`  ✓ ${site.name} 测试完成`);
    
  } catch (error) {
    console.log(`  ✗ ${site.name} 测试失败:`, error);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('=== 国内网站暗黑模式测试 ===');
  console.log(`共 ${chinaSites.length} 个网站待测试`);
  
  // 先检查是否需要编译
  const themesPath = path.join(EXTENSION_PATH, 'src', 'themes.js');
  const contentPath = path.join(EXTENSION_PATH, 'src', 'content.js');
  
  if (!fs.existsSync(themesPath) || !fs.existsSync(contentPath)) {
    console.log('\n⚠ 警告: 编译后的 JS 文件不存在');
    console.log('请先运行: npm run build');
    console.log('然后再次运行此测试\n');
    return;
  }
  
  // 测试前 5 个网站
  const sitesToTest = chinaSites.slice(0, 5);
  console.log(`\n将测试前 ${sitesToTest.length} 个网站...\n`);
  
  for (const site of sitesToTest) {
    await testSite(site);
  }
  
  console.log('\n=== 测试完成 ===');
  console.log(`截图保存在: ${SCREENSHOT_DIR}`);
  console.log('请查看截图并审核暗黑模式效果');
}

main().catch(console.error);
