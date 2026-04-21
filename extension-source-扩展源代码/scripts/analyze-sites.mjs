import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.join(process.cwd(), 'tests', 'screenshots', 'site-analysis');
const ANALYSIS_DIR = path.join(process.cwd(), 'scripts', 'site-analysis');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}
if (!fs.existsSync(ANALYSIS_DIR)) {
  fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
}

// 7个高频网站
const highPrioritySites = [
  { name: 'B站', url: 'https://www.bilibili.com', priority: 1, visits: 391 },
  { name: '百度地图', url: 'https://map.baidu.com', priority: 2, visits: 239 },
  { name: 'GitHub', url: 'https://github.com', priority: 3, visits: 119 },
  { name: 'Google', url: 'https://www.google.com', priority: 4, visits: 22 },
  { name: 'Discord', url: 'https://discord.com', priority: 5, visits: 15 },
  { name: 'Gmail', url: 'https://mail.google.com', priority: 6, visits: 12 },
  { name: 'Windsurf', url: 'https://windsurf.com', priority: 7, visits: 8 }
];

async function analyzeSite(site) {
  console.log(`\n分析 ${site.name} (${site.url})...`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // 获取HTML结构
    const html = await page.content();
    
    // 提取主要容器和类名
    const analysis = await page.evaluate(() => {
      const result = {
        title: document.title,
        bodyClasses: document.body.className,
        mainContainers: [],
        navElements: [],
        headerElements: [],
        footerElements: [],
        commonClasses: []
      };
      
      // 查找主要容器
      const mainTags = document.querySelectorAll('main, [role="main"], .main, .container, .wrapper');
      mainTags.forEach(el => {
        result.mainContainers.push({
          tag: el.tagName,
          class: el.className,
          id: el.id
        });
      });
      
      // 查找导航元素
      const navTags = document.querySelectorAll('nav, [role="navigation"], .nav, .navigation');
      navTags.forEach(el => {
        result.navElements.push({
          tag: el.tagName,
          class: el.className,
          id: el.id
        });
      });
      
      // 查找头部元素
      const headerTags = document.querySelectorAll('header, [role="banner"], .header, .topbar');
      headerTags.forEach(el => {
        result.headerElements.push({
          tag: el.tagName,
          class: el.className,
          id: el.id
        });
      });
      
      // 查找底部元素
      const footerTags = document.querySelectorAll('footer, [role="contentinfo"], .footer');
      footerTags.forEach(el => {
        result.footerElements.push({
          tag: el.tagName,
          class: el.className,
          id: el.id
        });
      });
      
      // 统计常见类名
      const allElements = document.querySelectorAll('*');
      const classCount = {};
      allElements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.split(' ');
          classes.forEach(cls => {
            if (cls && cls.length > 2) {
              classCount[cls] = (classCount[cls] || 0) + 1;
            }
          });
        }
      });
      
      result.commonClasses = Object.entries(classCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([cls, count]) => ({ class: cls, count }));
      
      return result;
    });
    
    // 保存分析结果
    const analysisPath = path.join(ANALYSIS_DIR, `${site.name}-analysis.json`);
    fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
    
    // 保存HTML
    const htmlPath = path.join(ANALYSIS_DIR, `${site.name}-html.html`);
    fs.writeFileSync(htmlPath, html);
    
    // 截图
    const screenshotPath = path.join(SCREENSHOT_DIR, `${site.name}-analysis.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    console.log(`  ✓ 分析完成: ${site.name}`);
    console.log(`    - 主要容器: ${analysis.mainContainers.length} 个`);
    console.log(`    - 导航元素: ${analysis.navElements.length} 个`);
    console.log(`    - 头部元素: ${analysis.headerElements.length} 个`);
    console.log(`    - 常见类名: ${analysis.commonClasses.length} 个`);
    
  } catch (error) {
    console.log(`  ✗ ${site.name} 分析失败:`, error.message);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('=== 网站结构分析 ===');
  console.log(`共 ${highPrioritySites.length} 个高频网站待分析\n`);
  
  for (const site of highPrioritySites) {
    await analyzeSite(site);
  }
  
  console.log('\n=== 分析完成 ===');
  console.log(`分析结果保存在: ${ANALYSIS_DIR}`);
  console.log(`截图保存在: ${SCREENSHOT_DIR}`);
}

main().catch(console.error);
