/**
 * content.js — 暗黑模式内容脚本
 * 采用 CSS 变量注入方式，效果更自然
 */

(function() {
  'use strict';

  const ID_VARS   = '__dm_vars__';
  const ID_STYLES = '__dm_styles__';

  if (window.__dmInit) return;
  window.__dmInit = true;

  let _observer = null;
  let _lastVars = '';

  // 主题色板
  const THEMES = {
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

  // 核心 CSS
  const DARK_CSS = `
    html { color-scheme: dark !important; }

    html, body {
      background-color: var(--dm-bg) !important;
      color: var(--dm-text) !important;
    }

    .dm-transitioning, .dm-transitioning *,
    .dm-transitioning *::before, .dm-transitioning *::after {
      transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease !important;
    }

    body, div, section, article, aside,
    nav, main, form, fieldset, details, summary,
    table, thead, tbody, tfoot, tr, td, th,
    ul, ol, li, dl, dt, dd,
    figure, figcaption, blockquote, pre, address {
      background-color: var(--dm-bg) !important;
      color: var(--dm-text) !important;
      border-color: var(--dm-border) !important;
    }

    [class~="card"], [class~="panel"],
    [class~="modal"], [class~="dialog"],
    [class~="drawer"], [class~="sidebar"],
    [class~="popup"], [class~="tooltip"] {
      background-color: var(--dm-bg2) !important;
      color: var(--dm-text) !important;
      border-color: var(--dm-border) !important;
    }

    [class~="header"], [class~="navbar"],
    [class~="toolbar"], [class~="appbar"] {
      background-color: var(--dm-bg3) !important;
      border-color: var(--dm-border) !important;
    }

    input:not([type="range"]):not([type="color"]):not([type="checkbox"]):not([type="radio"]),
    textarea, select {
      background-color: var(--dm-input) !important;
      color: var(--dm-text) !important;
      border-color: var(--dm-border) !important;
    }

    input::placeholder, textarea::placeholder {
      color: var(--dm-muted) !important;
      opacity: 1 !important;
    }

    a:not([class*="btn"]):not([class*="button"]) {
      color: var(--dm-link) !important;
    }

    code, pre, kbd, samp {
      background-color: var(--dm-bg2) !important;
      color: var(--dm-text) !important;
    }

    ::-webkit-scrollbar { background: var(--dm-scroll-bg) !important; width: 8px; height: 8px; }
    ::-webkit-scrollbar-thumb { background: var(--dm-scroll-th) !important; border-radius: 4px; }

    iframe { filter: invert(0.88) hue-rotate(180deg); }
  `;

  function upsertStyle(id, css) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      (document.head || document.documentElement).appendChild(el);
    }
    if (el.textContent !== css) el.textContent = css;
  }

  function removeStyle(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function buildVars(themeKey, brightness, contrast) {
    const t = THEMES[themeKey] || THEMES.dark;
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
      '--dm-scroll-th:' + t.scrollTh,
      'filter: brightness(' + brightness + '%) contrast(' + contrast + '%)'
    ].join('; ');
  }

  function apply(theme, brightness, contrast) {
    document.documentElement.classList.add('dm-transitioning');
    setTimeout(function() {
      document.documentElement.classList.remove('dm-transitioning');
    }, 350);

    var vars = buildVars(theme, brightness, contrast);
    _lastVars = vars;
    upsertStyle(ID_VARS, ':root { ' + vars + '; }');
    upsertStyle(ID_STYLES, DARK_CSS);
    startObserver();
  }

  function remove() {
    document.documentElement.classList.add('dm-transitioning');
    setTimeout(function() {
      document.documentElement.classList.remove('dm-transitioning');
    }, 350);
    removeStyle(ID_VARS);
    removeStyle(ID_STYLES);
    stopObserver();
  }

  function startObserver() {
    if (_observer) return;
    _observer = new MutationObserver(function() {
      if (!document.getElementById(ID_STYLES)) {
        stopObserver();
        if (_lastVars) {
          upsertStyle(ID_VARS, ':root { ' + _lastVars + '; }');
          upsertStyle(ID_STYLES, DARK_CSS);
          startObserver();
        }
      }
    });
    var head = document.head || document.documentElement;
    _observer.observe(head, { childList: true });
    if (document.documentElement !== head) {
      _observer.observe(document.documentElement, { childList: true });
    }
  }

  function stopObserver() {
    if (_observer) {
      _observer.disconnect();
      _observer = null;
    }
  }

  function isBlacklisted(whitelist) {
    var origin = window.location.origin;
    return (whitelist || []).indexOf(origin) !== -1;
  }

  function init(settings) {
    if (!settings.enabled || isBlacklisted(settings.whitelist)) {
      remove();
      return;
    }
    apply(settings.theme, settings.brightness, settings.contrast);
  }

  // Phase 1: 同步注入默认暗黑主题
  var defaultVars = buildVars('dark', 100, 100);
  _lastVars = defaultVars;
  upsertStyle(ID_VARS, ':root { ' + defaultVars + '; }');
  upsertStyle(ID_STYLES, DARK_CSS);
  startObserver();

  // Phase 2: 异步读取 storage 确认或回滚
  chrome.storage.local.get(['dmSettings'], function(result) {
    var settings = result.dmSettings || { enabled: true, theme: 'dark', brightness: 100, contrast: 100, whitelist: [] };
    init(settings);
  });

  // 监听消息
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.type === 'DM_APPLY') {
      init(msg.settings);
      sendResponse({ ok: true });
    } else if (msg.type === 'DM_REMOVE') {
      remove();
      sendResponse({ ok: true });
    }
    return true;
  });

})();
