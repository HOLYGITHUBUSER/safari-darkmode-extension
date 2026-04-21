import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTENSION_PATH = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(EXTENSION_PATH, 'tests', 'screenshots', 'china-sites');

// 网站列表（根据用户实际浏览频率排序）
const chinaSites = [
  { name: 'B站', url: 'https://www.bilibili.com', category: '视频', priority: 1, visits: 391 },
  { name: '百度地图', url: 'https://map.baidu.com', category: '地图', priority: 2, visits: 239 },
  { name: 'GitHub', url: 'https://github.com', category: '技术', priority: 3, visits: 119 },
  { name: 'Google', url: 'https://www.google.com', category: '搜索', priority: 4, visits: 22 },
  { name: 'Discord', url: 'https://discord.com', category: '社交', priority: 5, visits: 15 },
  { name: 'Gmail', url: 'https://mail.google.com', category: '邮件', priority: 6, visits: 12 },
  { name: 'Windsurf', url: 'https://windsurf.com', category: '工具', priority: 7, visits: 8 },
  { name: '百度', url: 'https://www.baidu.com', category: '搜索', priority: 8, visits: 0 },
  { name: '知乎', url: 'https://www.zhihu.com', category: '社交', priority: 9, visits: 0 },
  { name: '京东', url: 'https://www.jd.com', category: '电商', priority: 10, visits: 3 },
  { name: '淘宝', url: 'https://www.taobao.com', category: '电商', priority: 11, visits: 0 },
  { name: '微博', url: 'https://weibo.com', category: '社交', priority: 12, visits: 0 },
  { name: '掘金', url: 'https://juejin.cn', category: '技术', priority: 13, visits: 0 },
  { name: 'CSDN', url: 'https://www.csdn.net', category: '技术', priority: 14, visits: 0 },
  { name: '豆瓣', url: 'https://www.douban.com', category: '社交', priority: 15, visits: 0 },
  { name: '网易云音乐', url: 'https://music.163.com', category: '音乐', priority: 16, visits: 0 },
  { name: '小红书', url: 'https://www.xiaohongshu.com', category: '社交', priority: 17, visits: 0 },
  { name: '拼多多', url: 'https://www.pinduoduo.com', category: '电商', priority: 18, visits: 0 },
  { name: '优酷', url: 'https://www.youku.com', category: '视频', priority: 19, visits: 0 },
  { name: '爱奇艺', url: 'https://www.iqiyi.com', category: '视频', priority: 20, visits: 0 }
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
    const siteRulesPath = path.join(EXTENSION_PATH, 'src', 'site-rules.js');
    
    if (!fs.existsSync(themesPath) || !fs.existsSync(contentPath) || !fs.existsSync(siteRulesPath)) {
      console.log(`  ⚠ 编译后的 JS 文件不存在，请先运行 npm run build`);
      await browser.close();
      return;
    }
    
    await page.addScriptTag({ path: themesPath });
    await page.addScriptTag({ path: siteRulesPath });
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
  const siteRulesPath = path.join(EXTENSION_PATH, 'src', 'site-rules.js');
  
  if (!fs.existsSync(themesPath) || !fs.existsSync(contentPath) || !fs.existsSync(siteRulesPath)) {
    console.log('\n⚠ 警告: 编译后的 JS 文件不存在');
    console.log('请先运行: npm run build');
    console.log('然后再次运行此测试\n');
    return;
  }
  
  console.log(`\n将测试 ${chinaSites.length} 个网站...\n`);
  
  const results = {
    success: [],
    failed: []
  };
  
  for (const site of chinaSites) {
    try {
      await testSite(site);
      results.success.push(site.name);
    } catch (error) {
      results.failed.push(site.name);
    }
  }
  
  console.log('\n=== 测试完成 ===');
  console.log(`成功: ${results.success.length} 个网站`);
  console.log(`失败: ${results.failed.length} 个网站`);
  console.log(`截图保存在: ${SCREENSHOT_DIR}`);
  console.log('请查看截图并审核暗黑模式效果');
}

main().catch(console.error);
