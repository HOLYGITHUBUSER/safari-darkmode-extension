/**
 * themes.ts —— 主题定义与 CSS 生成
 * 编译后以独立脚本形式加载；通过挂载到 window 上与 content.ts 共享。
 */
(function (global: Window & typeof globalThis): void {
  'use strict';

  const THEMES: Record<ThemeKey, ThemePalette> = {
    dark: {
      bg: '#121212', bg2: '#1e1e1e', bg3: '#2a2a2a',
      text: '#e8e8e8', muted: '#a0a0a0', border: '#333333',
      link: '#9d8aff', linkHov: '#b8a8ff', input: '#1e1e2e',
      scrollBg: '#1a1a2a', scrollTh: '#3a3a5c',
    },
    sepia: {
      bg: '#1c1510', bg2: '#2a1f14', bg3: '#3a2e1a',
      text: '#f0e6c8', muted: '#c8b898', border: '#4a3c22',
      link: '#d4a843', linkHov: '#e8c060', input: '#2a1f14',
      scrollBg: '#1c1510', scrollTh: '#5a4a28',
    },
    midnight: {
      bg: '#0a0e1a', bg2: '#111827', bg3: '#1e2d45',
      text: '#cbd5e1', muted: '#94a3b8', border: '#1e2d45',
      link: '#60a5fa', linkHov: '#93c5fd', input: '#111827',
      scrollBg: '#0a0e1a', scrollTh: '#1e3a5f',
    },
    forest: {
      bg: '#0a1a0d', bg2: '#112214', bg3: '#1a3320',
      text: '#d4edda', muted: '#a8d5b5', border: '#1a3320',
      link: '#4ade80', linkHov: '#86efac', input: '#112214',
      scrollBg: '#0a1a0d', scrollTh: '#1a4a28',
    },
  };

  function clamp(n: number, min: number, max: number): number {
    const v = Number(n);
    if (!isFinite(v)) return min;
    return Math.max(min, Math.min(max, v));
  }

  // 只返回 CSS 变量声明（不含 filter），避免把 filter 加在 :root 上污染整页
  function buildVars(themeKey: ThemeKey): string {
    const t = THEMES[themeKey] || THEMES.dark;
    return [
      `--dm-bg:${t.bg}`,
      `--dm-bg2:${t.bg2}`,
      `--dm-bg3:${t.bg3}`,
      `--dm-text:${t.text}`,
      `--dm-muted:${t.muted}`,
      `--dm-border:${t.border}`,
      `--dm-link:${t.link}`,
      `--dm-link-hov:${t.linkHov}`,
      `--dm-input:${t.input}`,
      `--dm-scroll-bg:${t.scrollBg}`,
      `--dm-scroll-th:${t.scrollTh}`,
    ].join('; ');
  }

  // 亮度/对比度独立作用到 <html>，并反向作用到图片/视频，避免它们被二次处理
  function buildFilterCss(brightness: number, contrast: number): string {
    const b = clamp(brightness, 50, 200);
    const c = clamp(contrast, 50, 200);
    if (b === 100 && c === 100) return '';
    return (
      `html.dm-on { filter: brightness(${b}%) contrast(${c}%); }\n` +
      `html.dm-on img, html.dm-on video, html.dm-on canvas, html.dm-on picture {` +
      ` filter: brightness(${(10000 / b).toFixed(2)}%) contrast(${(10000 / c).toFixed(2)}%); }\n`
    );
  }

  const BASE_CSS: string = [
    'html.dm-on { color-scheme: dark !important; background-color: var(--dm-bg) !important; }',
    'html.dm-on body { background-color: var(--dm-bg) !important; color: var(--dm-text) !important; }',

    // 过渡
    'html.dm-transitioning, html.dm-transitioning * , html.dm-transitioning *::before, html.dm-transitioning *::after {' +
    ' transition: background-color .2s ease, color .2s ease, border-color .2s ease !important; }',

    // 文本颜色
    'html.dm-on body, html.dm-on p, html.dm-on span, html.dm-on li, html.dm-on td, html.dm-on th,' +
    ' html.dm-on h1, html.dm-on h2, html.dm-on h3, html.dm-on h4, html.dm-on h5, html.dm-on h6,' +
    ' html.dm-on label, html.dm-on dt, html.dm-on dd, html.dm-on figcaption, html.dm-on blockquote {' +
    ' color: var(--dm-text) !important; }',

    // 表格
    'html.dm-on table { background-color: var(--dm-bg) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',
    'html.dm-on thead, html.dm-on thead tr, html.dm-on thead th {' +
    ' background-color: var(--dm-bg2) !important; color: var(--dm-muted) !important; border-color: var(--dm-border) !important; font-weight: 600;}',
    'html.dm-on tbody, html.dm-on tbody tr, html.dm-on tbody td, html.dm-on tfoot, html.dm-on tfoot tr, html.dm-on tfoot td {' +
    ' background-color: var(--dm-bg) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',
    'html.dm-on tbody tr:nth-child(even) td { background-color: var(--dm-bg2) !important; }',
    'html.dm-on tbody tr:hover td { background-color: var(--dm-bg3) !important; }',

    // 布局容器（__SKIP__ 会在下方替换为排除规则）
    'html.dm-on :is(main, section, article, aside)__SKIP__ {' +
    ' background-color: var(--dm-bg) !important; color: var(--dm-text) !important; }',
    'html.dm-on :is([class*="layout"],[class*="container"],[class*="wrapper"],[class*="page-"],[class*="-page"],[class*="main-"],[class*="-main"],[class*="content"],[class*="feed"],[class*="recommend"],[class*="section"])__SKIP__ {' +
    ' background-color: var(--dm-bg) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',

    // 卡片/面板/弹层
    'html.dm-on :is([class*="card"],[class*="panel"],[class*="modal"],[class*="dialog"],[class*="drawer"],[class*="sidebar"],[class*="popup"],[class*="tooltip"],[class*="menu"],[class*="dropdown"],[class*="tile"])__SKIP__ {' +
    ' background-color: var(--dm-bg2) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',

    // 顶栏/导航/底栏
    'html.dm-on :is(header, nav, footer, [class*="header"],[class*="navbar"],[class*="toolbar"],[class*="appbar"],[class*="topbar"])__SKIP__ {' +
    ' background-color: var(--dm-bg3) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',

    // 图片/媒体容器：强制透明背景
    'html.dm-on :is([class*="image"],[class*="img"],[class*="cover"],[class*="photo"],[class*="picture"],[class*="media"],[class*="thumb"],[class*="poster"],[class*="banner"],[class*="carousel"],[class*="slide"],[class*="swiper"],[class*="v-img"]) {' +
    ' background-color: transparent !important; }',
    'html.dm-on img, html.dm-on picture, html.dm-on video, html.dm-on canvas, html.dm-on source {' +
    ' visibility: visible !important; opacity: 1 !important; }',

    // ========== 地图站点适配 ==========
    // 容器透出瓦片（#MapHolder 是百度 map.baidu.com 的顶层容器）
    'html.dm-on.dm-map-site :is(#map, #map_canvas, #mapContainer, #J_mapContainer, #allmap, #MapHolder, .map-container, .mapboxgl-map, .leaflet-container, .ol-viewport, .amap-container, .amap-maps, .bmap-container, .gm-style, [class*="mapbox"], [class*="leaflet"], [class*="amap"], [class*="openlayers"], [class*="ol-viewport"]) {' +
    ' background-color: transparent !important; border-color: transparent !important; }',

    // 瓦片渲染面：invert + hue-rotate
    // 注意：百度地图 BMapGL 为 WebGL/Canvas 渲染，页面上混有覆盖物 canvas 和标注 canvas，
    // 无法可靠地只挑出"底图 canvas"。这里对百度不做 canvas 反色，只暗化周边 UI，
    // 避免错误反色把 marker/POI 也反掉的回归。
    'html.dm-on.dm-map-site :is(' +
    '.gm-style > div > div > div > div,' +
    '.gm-style img,' +
    '.mapboxgl-canvas, .mapboxgl-canvas-container canvas,' +
    '.leaflet-tile-pane, .leaflet-tile, .leaflet-layer img,' +
    '.amap-layer, .amap-layers, .amap-layer img, .amap-overlay canvas,' +
    '.ol-layer canvas, .ol-layer img,' +
    '[class*="tile-layer"] img, [class*="TileLayer"] img' +
    ') { filter: invert(0.92) hue-rotate(180deg) brightness(0.95) contrast(1.05) !important; }',

    // 标注/marker 不反色
    'html.dm-on.dm-map-site :is(' +
    '.gm-style-iw, .gm-style-iw *,' +
    '.mapboxgl-marker, .mapboxgl-popup, .mapboxgl-popup *,' +
    '.leaflet-marker-icon, .leaflet-popup, .leaflet-popup *, .leaflet-control,' +
    '.amap-marker, .amap-marker-content, .amap-info, .amap-info-content, .amap-overlay,' +
    '.ol-overlay-container, .ol-control' +
    ') { filter: none !important; }',

    // 百度地图 (BMapGL)：保护 #MapHolder 内所有 canvas 不被任何全局 filter 规则污染
    'html.dm-on.dm-map-site #MapHolder canvas, html.dm-on.dm-map-site #MapHolder img {' +
    ' filter: none !important; }',

    // 地图控件
    'html.dm-on.dm-map-site :is(.leaflet-control, .mapboxgl-ctrl, .gm-control-active, .gm-bundled-control, .amap-toolbar, .amap-controls, .BMap_stdMpCtrl, .ol-control) {' +
    ' background-color: var(--dm-bg2) !important; color: var(--dm-text) !important; border-color: var(--dm-border) !important; }',
    'html.dm-on.dm-map-site :is(.leaflet-control button, .mapboxgl-ctrl button, .amap-toolbar *, .BMap_stdMpCtrl *) {' +
    ' background-color: var(--dm-bg2) !important; color: var(--dm-text) !important; }',

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
    'html.dm-on ::-webkit-scrollbar-thumb { background: var(--dm-scroll-th) !important; border-radius: 5px; }',
  ].join('\n');

  // 背景染色规则中排除：按钮、图标、头像、媒体容器等
  const SKIP: string = ':not(:is(' + [
    '[class*="btn"]', '[class*="button"]',
    '[class*="icon"]', '[class*="avatar"]',
    '[class*="tag"]', '[class*="badge"]', '[class*="chip"]',
    '[class*="image"]', '[class*="img"]', '[class*="cover"]',
    '[class*="photo"]', '[class*="picture"]', '[class*="media"]',
    '[class*="thumb"]', '[class*="poster"]', '[class*="banner"]',
    '[class*="carousel"]', '[class*="slide"]', '[class*="swiper"]',
    '[class*="skeleton"]', '[class*="mask"]',
    '[class*="v-img"]',
  ].join(',') + '))';

  const DARK_CSS: string = BASE_CSS.replace(/__SKIP__/g, SKIP);

  global.DM_THEMES = THEMES;
  global.DM_buildVars = buildVars;
  global.DM_buildFilterCss = buildFilterCss;
  global.DM_DARK_CSS = DARK_CSS;
})(typeof window !== 'undefined' ? window : (globalThis as Window & typeof globalThis));
