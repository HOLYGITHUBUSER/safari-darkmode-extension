/**
 * content.js —— 暗黑模式内容脚本
 * - 使用 <html class="dm-on"> 作为总开关，避免全局 filter 污染
 * - 白名单（whitelist）= 用户希望"保持网站原样（禁用暗黑）"的站点
 */
(function () {
  'use strict';

  if (window.__dmInit) return;
  window.__dmInit = true;

  var ID_VARS = '__dm_vars__';
  var ID_STYLES = '__dm_styles__';
  var ID_FILTER = '__dm_filter__';
  var CLS_ON = 'dm-on';
  var CLS_TRANS = 'dm-transitioning';

  var _observer = null;
  var _lastVars = '';
  var _lastCss = '';
  var _lastFilter = '';

  function root() { return document.documentElement; }

  function upsertStyle(id, css) {
    var el = document.getElementById(id);
    if (!css) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      (document.head || document.documentElement).appendChild(el);
    }
    if (el.textContent !== css) el.textContent = css;
  }

  function apply(theme, brightness, contrast) {
    var r = root();
    r.classList.add(CLS_TRANS);
    setTimeout(function () { r.classList.remove(CLS_TRANS); }, 350);

    _lastVars = window.DM_buildVars(theme, brightness, contrast);
    _lastCss = window.DM_DARK_CSS;
    _lastFilter = window.DM_buildFilterCss(brightness, contrast);

    upsertStyle(ID_VARS, ':root { ' + _lastVars + '; }');
    upsertStyle(ID_STYLES, _lastCss);
    upsertStyle(ID_FILTER, _lastFilter);
    r.classList.add(CLS_ON);
    startObserver();
  }

  function remove() {
    var r = root();
    r.classList.add(CLS_TRANS);
    setTimeout(function () { r.classList.remove(CLS_TRANS); }, 350);
    r.classList.remove(CLS_ON);
    upsertStyle(ID_VARS, '');
    upsertStyle(ID_STYLES, '');
    upsertStyle(ID_FILTER, '');
    stopObserver();
  }

  function reinject() {
    if (!root().classList.contains(CLS_ON)) return;
    if (_lastVars) upsertStyle(ID_VARS, ':root { ' + _lastVars + '; }');
    if (_lastCss) upsertStyle(ID_STYLES, _lastCss);
    if (_lastFilter) upsertStyle(ID_FILTER, _lastFilter);
  }

  function startObserver() {
    if (_observer) return;
    _observer = new MutationObserver(function () {
      // 若 style 节点被移除（某些 SPA 会清空 head），重新注入
      if (root().classList.contains(CLS_ON) &&
          (!document.getElementById(ID_STYLES) || !document.getElementById(ID_VARS))) {
        reinject();
      }
    });
    var head = document.head || document.documentElement;
    _observer.observe(head, { childList: true });
    if (document.documentElement !== head) {
      _observer.observe(document.documentElement, { childList: true, attributes: true, attributeFilter: ['class'] });
    }
  }

  function stopObserver() {
    if (_observer) { _observer.disconnect(); _observer = null; }
  }

  function isWhitelisted(whitelist) {
    try {
      var origin = window.location.origin;
      return (whitelist || []).indexOf(origin) !== -1;
    } catch (e) { return false; }
  }

  function init(settings) {
    if (!settings || !settings.enabled || isWhitelisted(settings.whitelist)) {
      remove();
      return;
    }
    apply(settings.theme || 'dark',
          typeof settings.brightness === 'number' ? settings.brightness : 100,
          typeof settings.contrast === 'number' ? settings.contrast : 100);
  }

  // 同步读取同步的默认值之前先不注入任何东西，避免非暗黑用户遭遇"反向 FOUC"
  // 但为了减少白→黑抖动，我们依赖 storage 的同步回调（通常很快）
  try {
    chrome.storage.local.get(['dmSettings'], function (result) {
      var s = (result && result.dmSettings) || { enabled: true, theme: 'dark', brightness: 100, contrast: 100, whitelist: [] };
      init(s);
    });
  } catch (e) {
    // storage 不可用时退化为默认启用
    init({ enabled: true, theme: 'dark', brightness: 100, contrast: 100, whitelist: [] });
  }

  // storage 变化时即时响应（popup 修改后无需发消息也能同步）
  try {
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== 'local' || !changes.dmSettings) return;
      init(changes.dmSettings.newValue || {});
    });
  } catch (e) { /* ignore */ }

  // 兼容消息通道
  try {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
      if (!msg || !msg.type) return;
      if (msg.type === 'DM_APPLY') { init(msg.settings || {}); sendResponse && sendResponse({ ok: true }); }
      else if (msg.type === 'DM_REMOVE') { remove(); sendResponse && sendResponse({ ok: true }); }
      return true;
    });
  } catch (e) { /* ignore */ }
})();
