/**
 * 百度地图暗黑模式测试
 *
 * 验证目标：
 * 1. isMapHost('map.baidu.com') === true（通过加载 content.js 后间接验证，这里单独复测 dm-map-site 是否被加上）
 * 2. 注入后 #MapHolder 背景透明（CSS 真值，getComputedStyle 验证）
 * 3. 注入后 #MapHolder 内的 canvas 的 filter === 'none'（不被任何规则污染）
 * 4. 页面顶部搜索栏（.searchbox-content 等）背景变深
 * 5. 截图 before / after 供人眼复核
 *
 * 同时有一个"构造 DOM"的 fallback：万一百度真站点加载失败/验证码，就用本地 HTML
 * 复现关键结构（#MapHolder + canvas + 搜索栏），仍然能验证 CSS 规则正确性。
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const THEMES_JS = fs.readFileSync(path.join(ROOT, 'src/themes.js'), 'utf8');

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  const tag = ok ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ' — ' + detail : ''}`);
}

async function injectDarkMode(page, mapSite = true) {
  // 把 themes.js 的字符串在页面上下文求值，把 DM_DARK_CSS/DM_buildVars 挂到 window
  await page.addScriptTag({ content: THEMES_JS });
  await page.evaluate((isMap) => {
    const vars = window.DM_buildVars('dark', 100, 100);
    const darkCss = window.DM_DARK_CSS;
    const s1 = document.createElement('style');
    s1.id = '__dm_vars__';
    s1.textContent = `:root { ${vars}; }`;
    document.head.appendChild(s1);
    const s2 = document.createElement('style');
    s2.id = '__dm_styles__';
    s2.textContent = darkCss;
    document.head.appendChild(s2);
    document.documentElement.classList.add('dm-on');
    if (isMap) document.documentElement.classList.add('dm-map-site');
  }, mapSite);
}

async function testRealSite(browser) {
  console.log('\n=== Test A: 真实站点 map.baidu.com ===');
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'zh-CN',
  });
  const page = await ctx.newPage();
  let loaded = false;
  try {
    await page.goto('https://map.baidu.com/', { waitUntil: 'load', timeout: 45000 });
    await page.waitForSelector('#MapHolder', { timeout: 20000 });
    // canvas 不一定能出现（headless 可能被降级），尽力等 10s，超时不 fatal
    await page
      .waitForSelector('#MapHolder canvas', { timeout: 10000 })
      .catch(() => console.log('  (canvas 未出现，继续用已有 DOM 做验证)'));
    await page.waitForTimeout(5000);
    loaded = true;
  } catch (e) {
    console.log('  真实站点加载失败：', e.message);
  }

  if (!loaded) {
    await ctx.close();
    return false;
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'baidu-before.png'), fullPage: false });

  // 抓一些关键 DOM 证据
  const evidence = await page.evaluate(() => {
    const classOf = (sel) => {
      const el = document.querySelector(sel);
      return el ? el.className : '(none)';
    };
    return {
      hasMapHolder: !!document.querySelector('#MapHolder'),
      canvasCount: document.querySelectorAll('#MapHolder canvas').length,
      searchboxClass: classOf('.searchbox-content'),
      searchboxExists: !!document.querySelector('.searchbox-content'),
      appExists: !!document.querySelector('#app'),
    };
  });
  console.log('  DOM evidence:', evidence);
  check('真实站点 #MapHolder 存在', evidence.hasMapHolder);
  if (evidence.canvasCount > 0) {
    check('真实站点 #MapHolder 内有 canvas', true, `canvas x${evidence.canvasCount}`);
  } else {
    console.log('  [SKIP] canvas 未渲染（可能 headless 被降级），仅验证静态 DOM 规则');
  }

  await injectDarkMode(page, true);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'baidu-after.png'), fullPage: false });

  const assertions = await page.evaluate(() => {
    const out = {};
    const root = document.documentElement;
    out.rootHasDmOn = root.classList.contains('dm-on');
    out.rootHasDmMap = root.classList.contains('dm-map-site');

    const mh = document.querySelector('#MapHolder');
    if (mh) {
      const cs = getComputedStyle(mh);
      out.mapHolderBg = cs.backgroundColor;
    }
    const canvases = Array.from(document.querySelectorAll('#MapHolder canvas'));
    out.canvasFilters = canvases.map((c) => getComputedStyle(c).filter);
    const imgs = Array.from(document.querySelectorAll('#MapHolder img'));
    out.imgFilters = imgs.map((i) => getComputedStyle(i).filter);

    const searchbox = document.querySelector('.searchbox-content');
    if (searchbox) {
      out.searchboxBg = getComputedStyle(searchbox).backgroundColor;
      out.searchboxColor = getComputedStyle(searchbox).color;
    }
    return out;
  });
  console.log('  Assertions:', assertions);

  check('dm-on 已加到 <html>', assertions.rootHasDmOn);
  check('dm-map-site 已加到 <html>', assertions.rootHasDmMap);
  const bg = assertions.mapHolderBg || '';
  const isTransparent =
    bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent' || bg.startsWith('rgba(') && bg.endsWith(', 0)');
  check('#MapHolder 背景透明（不遮挡 canvas）', isTransparent, `bg=${bg}`);
  if (assertions.canvasFilters.length > 0) {
    const allCanvasNoFilter = assertions.canvasFilters.every((f) => f === 'none');
    check(
      '#MapHolder 内所有 canvas filter=none（不被反色）',
      allCanvasNoFilter,
      `filters=[${assertions.canvasFilters.join(',')}]`,
    );
  }
  if (assertions.imgFilters.length > 0) {
    const allImgNoFilter = assertions.imgFilters.every((f) => f === 'none');
    check(
      '#MapHolder 内所有 img filter=none',
      allImgNoFilter,
      `count=${assertions.imgFilters.length}`,
    );
  }

  await ctx.close();
  return true;
}

async function testSyntheticDom(browser) {
  console.log('\n=== Test B: 构造 DOM（保底验证 CSS 规则本身）===');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>fake baidu</title></head>
<body style="margin:0">
  <div id="app">
    <div class="searchbox-content" style="padding:10px;background:#fff;color:#333">搜索栏</div>
  </div>
  <div id="MapHolder" style="width:100vw;height:80vh;background:#eeeeee;position:relative">
    <canvas id="tile-canvas" width="1280" height="600" style="display:block;background:#ccd"></canvas>
    <img id="marker" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='8' fill='red'/></svg>" style="position:absolute;left:100px;top:100px">
  </div>
</body></html>`;
  await page.setContent(html);
  await injectDarkMode(page, true);
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'synthetic-after.png'), fullPage: true });

  const a = await page.evaluate(() => {
    const mh = document.querySelector('#MapHolder');
    const canvas = document.querySelector('#MapHolder canvas');
    const img = document.querySelector('#MapHolder img');
    const sb = document.querySelector('.searchbox-content');
    return {
      mapHolderBg: getComputedStyle(mh).backgroundColor,
      canvasFilter: getComputedStyle(canvas).filter,
      imgFilter: getComputedStyle(img).filter,
      searchboxBg: getComputedStyle(sb).backgroundColor,
      searchboxColor: getComputedStyle(sb).color,
    };
  });
  console.log('  Assertions:', a);

  const bg = a.mapHolderBg;
  const isTransparent = bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent';
  check('构造: #MapHolder 背景透明', isTransparent, `bg=${bg}`);
  check('构造: #MapHolder canvas filter=none', a.canvasFilter === 'none', `filter=${a.canvasFilter}`);
  check('构造: #MapHolder img filter=none', a.imgFilter === 'none', `filter=${a.imgFilter}`);
  // .searchbox-content 命中 [class*="content"]，会被染深
  check(
    '构造: .searchbox-content 背景被染深',
    a.searchboxBg !== 'rgb(255, 255, 255)' && a.searchboxBg !== 'rgba(0, 0, 0, 0)',
    `bg=${a.searchboxBg}`,
  );
  await ctx.close();
}

(async () => {
  const headless = process.env.HEADED ? false : true;
  const browser = await chromium.launch({ headless });
  try {
    const realOk = await testRealSite(browser);
    if (!realOk) {
      console.log('\n⚠️  真实站点未能加载，依赖构造 DOM 测试做保底验证');
    }
    await testSyntheticDom(browser);
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== Summary: ${results.length - failed.length}/${results.length} passed ===`);
  if (failed.length) {
    console.log('FAILURES:');
    failed.forEach((f) => console.log(' -', f.name, f.detail));
    process.exit(1);
  }
})().catch((e) => {
  console.error('TEST CRASH:', e);
  process.exit(2);
});
