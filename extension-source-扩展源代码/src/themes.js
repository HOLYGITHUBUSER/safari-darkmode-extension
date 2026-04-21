/**
 * themes.js —— 主题定义与 CSS 生成
 * 暴露到 window 上，供 content.js 使用
 */
(function (global) {
  'use strict';

  var THEMES = {
    dark: {
      bg: '#121212', bg2: '#1e1e1e', bg3: '#2a2a2a',
      text: '#e8e8e8', muted: '#a0a0a0', border: '#333333',
      link: '#9d8aff', linkHov: '#b8a8ff', input: '#1e1e2e',
      scrollBg: '#1a1a2a', scrollTh: '#3a3a5c'
    },
    sepia: {
      bg: '#1c1510', bg2: '#2a1f14', bg3: '#3a2e1a',
      text: '#f0e6c8', muted: '#c8b898', border: '#4a3c22',
      link: '#d4a843', linkHov: '#e8c060', input: '#2a1f14',
      scrollBg: '#1c1510', scrollTh: '#5a4a28'
    },
    midnight: {
      bg: '#0a0e1a', bg2: '#111827', bg3: '#1e2d45',
      text: '#cbd5e1', muted: '#94a3b8', border: '#1e2d45',
      link: '#60a5fa', linkHov: '#93c5fd', input: '#111827',
      scrollBg: '#0a0e1a', scrollTh: '#1e3a5f'
    },
    forest: {
      bg: '#0a1a0d', bg2: '#112214', bg3: '#1a3320',
      text: '#d4edda', muted: '#a8d5b5', border: '#1a3320',
      link: '#4ade80', linkHov: '#86efac', input: '#112214',
      scrollBg: '#0a1a0d', scrollTh: '#1a4a28'
    }
  };

  function clamp(n, min, max) {
    n = Number(n);
    if (!isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  // 只返回 CSS 变量声明（不含 filter），避免把 filter 加在 :root 上污染整页
  function buildVars(themeKey, _brightness, _contrast) {
    var t = THEMES[themeKey] || THEMES.dark;
    return [
      '--dm-bg:' + t.bg,
      '--dm-bg2:' + t.bg2,
      '--dm-bg3:' + t.bg3,
      '--dm-text:' + t.text,
      '--dm-muted:' + t.muted,
      '--dm-border:' + t.border,
      '--dm-link:' + t.link,
      '--dm-link-hov:' + t.linkHov,
      '--dm-input:' + t.input,
      '--dm-scroll-bg:' + t.scrollBg,
      '--dm-scroll-th:' + t.scrollTh
    ].join('; ');
  }

  // 亮度/对比度独立作用到 <html>，并排除图片/视频/canvas，避免它们被二次处理
  function buildFilterCss(brightness, contrast) {
    var b = clamp(brightness, 50, 200);
    var c = clamp(contrast, 50, 200);
    if (b === 100 && c === 100) return '';
    return (
      'html.dm-on { filter: brightness(' + b + '%) contrast(' + c + '%); }\n' +
      'html.dm-on img, html.dm-on video, html.dm-on canvas, html.dm-on picture {' +
      ' filter: brightness(' + (10000 / b).toFixed(2) + '%) contrast(' + (10000 / c).toFixed(2) + '%); }\n'
    );
  }

  var DARK_CSS = [
    'html.dm-on { color-scheme: dark !important; background-color: var(--dm-bg) !important; }',
    'html.dm-on body { background-color: var(--dm-bg) !important; color: var(--dm-text) !important; }',

    // 过渡
    'html.dm-transitioning, html.dm-transitioning * , html.dm-transitioning *::before, html.dm-transitioning *::after {' +
    ' transition: background-color .2s ease, color .2s ease, border-color .2s ease !important; }',

    // 文本颜色（不强行改背景，避免把有设计的容器全部抹平）
    'html.dm-on body, html.dm-on p, html.dm-on span, html.dm-on li, html.dm-on td, html.dm-on th,' +
    ' html.dm-on h1, html.dm-on h2, html.dm-on h3, html.dm-on h4, html.dm-on h5, html.dm-on h6,' +
    ' html.dm-on label, html.dm-on dt, html.dm-on dd, html.dm-on figcaption, html.dm-on blockquote {' +
    ' color: var(--dm-text) !important; }',

    // 表格：表头与卡片同色（bg2）不突兀，body 稍深（bg），条纹行更深
    'html.dm-on table { background-color: var(--dm-bg) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',
    'html.dm-on thead, html.dm-on thead tr, html.dm-on thead th {' +
    ' background-color: var(--dm-bg2) !important; color: var(--dm-muted) !important; border-color: var(--dm-border) !important; font-weight: 600;}',
    'html.dm-on tbody, html.dm-on tbody tr, html.dm-on tbody td, html.dm-on tfoot, html.dm-on tfoot tr, html.dm-on tfoot td {' +
    ' background-color: var(--dm-bg) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',
    'html.dm-on tbody tr:nth-child(even) td { background-color: var(--dm-bg2) !important; }',
    'html.dm-on tbody tr:hover td { background-color: var(--dm-bg3) !important; }',

    // 统一排除列表（按钮/图标/媒体容器/标签 等 —— 这些不该被染色覆盖）
    // __SKIP__ 占位会在下方替换
    'html.dm-on :is(main, section, article, aside)__SKIP__ {' +
    ' background-color: var(--dm-bg) !important; color: var(--dm-text) !important; }',
    'html.dm-on :is([class*="layout"],[class*="container"],[class*="wrapper"],[class*="page-"],[class*="-page"],[class*="main-"],[class*="-main"],[class*="content"],[class*="feed"],[class*="recommend"],[class*="section"])__SKIP__ {' +
    ' background-color: var(--dm-bg) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',

    // 卡片/面板/弹层 —— 次深
    'html.dm-on :is([class*="card"],[class*="panel"],[class*="modal"],[class*="dialog"],[class*="drawer"],[class*="sidebar"],[class*="popup"],[class*="tooltip"],[class*="menu"],[class*="dropdown"],[class*="tile"])__SKIP__ {' +
    ' background-color: var(--dm-bg2) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',

    // 顶栏/导航/底栏 —— 最深
    'html.dm-on :is(header, nav, footer, [class*="header"],[class*="navbar"],[class*="toolbar"],[class*="appbar"],[class*="topbar"])__SKIP__ {' +
    ' background-color: var(--dm-bg3) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',

    // 图片/视频/媒体容器：强制透明背景，避免盖住图片
    'html.dm-on :is([class*="image"],[class*="img"],[class*="cover"],[class*="photo"],[class*="picture"],[class*="media"],[class*="thumb"],[class*="poster"],[class*="banner"],[class*="carousel"],[class*="slide"],[class*="swiper"],[class*="v-img"]) {' +
    ' background-color: transparent !important; }',
    'html.dm-on img, html.dm-on picture, html.dm-on video, html.dm-on canvas, html.dm-on source {' +
    ' visibility: visible !important; opacity: 1 !important; }',

    // 表单
    'html.dm-on input:not([type="range"]):not([type="color"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]),' +
    ' html.dm-on textarea, html.dm-on select {' +
    ' background-color: var(--dm-input) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',
    'html.dm-on input::placeholder, html.dm-on textarea::placeholder { color: var(--dm-muted) !important; opacity: 1 !important; }',

    // 链接
    'html.dm-on a:not([class*="btn"]):not([class*="button"]) { color: var(--dm-link) !important; }',
    'html.dm-on a:not([class*="btn"]):not([class*="button"]):hover { color: var(--dm-link-hov) !important; }',

    // 代码
    'html.dm-on code, html.dm-on pre, html.dm-on kbd, html.dm-on samp {' +
    ' background-color: var(--dm-bg2) !important; color: var(--dm-text) !important; }',

    // 滚动条
    'html.dm-on ::-webkit-scrollbar { background: var(--dm-scroll-bg) !important; width: 10px; height: 10px; }',
    'html.dm-on ::-webkit-scrollbar-thumb { background: var(--dm-scroll-th) !important; border-radius: 5px; }'
  ].join('\n');

  // 在背景染色规则中排除：按钮、图标、头像、媒体容器（image/cover/pic 等）、状态标签、骨架
  var SKIP = ':not(:is(' + [
    '[class*="btn"]', '[class*="button"]',
    '[class*="icon"]', '[class*="avatar"]',
    '[class*="tag"]', '[class*="badge"]', '[class*="chip"]',
    '[class*="image"]', '[class*="img"]', '[class*="cover"]',
    '[class*="photo"]', '[class*="picture"]', '[class*="media"]',
    '[class*="thumb"]', '[class*="poster"]', '[class*="banner"]',
    '[class*="carousel"]', '[class*="slide"]', '[class*="swiper"]',
    '[class*="skeleton"]', '[class*="mask"]',
    '[class*="v-img"]'
  ].join(',') + '))';
  DARK_CSS = DARK_CSS.replace(/__SKIP__/g, SKIP);

  global.DM_THEMES = THEMES;
  global.DM_buildVars = buildVars;
  global.DM_buildFilterCss = buildFilterCss;
  global.DM_DARK_CSS = DARK_CSS;
})(typeof window !== 'undefined' ? window : this);
