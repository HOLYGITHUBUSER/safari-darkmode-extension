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
