import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTENSION_PATH = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(EXTENSION_PATH, 'tests', 'screenshots', 'china-sites');

const chinaSites = [
  { name: '微博', url: 'https://weibo.com', category: '社交' },
  { name: '知乎', url: 'https://www.zhihu.com', category: '社交' },
  { name: 'B站', url: 'https://www.bilibili.com', category: '视频' },
  { name: '淘宝', url: 'https://www.taobao.com', category: '电商' },
  { name: '京东', url: 'https://www.jd.com', category: '电商' }
];

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function testSite(site) {
  console.log(`\n测试 ${site.name} (${site.url})...`);
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  try {
    await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const beforePath = path.join(SCREENSHOT_DIR, `${site.name}-before.png`);
    await page.screenshot({ path: beforePath, fullPage: false });
    console.log(`  ✓ 保存截图: ${site.name}-before.png`);
    
    const themesPath = path.join(EXTENSION_PATH, 'src', 'themes.js');
    const contentPath = path.join(EXTENSION_PATH, 'src', 'content.js');
    
    if (!fs.existsSync(themesPath) || !fs.existsSync(contentPath)) {
      console.log(`  ⚠ 编译后的 JS 文件不存在，请先运行 npm run build`);
      await browser.close();
      return;
    }
    
    await page.addScriptTag({ path: themesPath });
    await page.addScriptTag({ path: contentPath });
    
    await page.evaluate(() => {
      window.chrome = {
        storage: {
          local: {
            get: (keys, callback) => {
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
            set: (items, callback) => {
              if (callback) callback();
              return Promise.resolve();
            }
          }
        }
      };
    });
    
    await page.evaluate(() => {
      document.documentElement.classList.add('dm-on');
    });
    
    await page.waitForTimeout(1000);
    
    const afterPath = path.join(SCREENSHOT_DIR, `${site.name}-after.png`);
    await page.screenshot({ path: afterPath, fullPage: false });
    console.log(`  ✓ 保存截图: ${site.name}-after.png`);
    
    console.log(`  ✓ ${site.name} 测试完成`);
    
  } catch (error) {
    console.log(`  ✗ ${site.name} 测试失败:`, error.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('=== 国内网站暗黑模式测试 ===');
  console.log(`共 ${chinaSites.length} 个网站待测试`);
  
  const themesPath = path.join(EXTENSION_PATH, 'src', 'themes.js');
  const contentPath = path.join(EXTENSION_PATH, 'src', 'content.js');
  
  if (!fs.existsSync(themesPath) || !fs.existsSync(contentPath)) {
    console.log('\n⚠ 警告: 编译后的 JS 文件不存在');
    console.log('请先运行: npm run build');
    console.log('然后再次运行此测试\n');
    return;
  }
  
  console.log(`\n将测试 ${chinaSites.length} 个网站...\n`);
  
  for (const site of chinaSites) {
    await testSite(site);
  }
  
  console.log('\n=== 测试完成 ===');
  console.log(`截图保存在: ${SCREENSHOT_DIR}`);
  console.log('请查看截图并审核暗黑模式效果');
}

main().catch(console.error);
