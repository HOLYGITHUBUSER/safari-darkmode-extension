/**
 * content.ts —— 暗黑模式内容脚本
 * - 使用 <html class="dm-on"> 作为总开关，避免全局 filter 污染
 * - whitelist = 用户希望"保持网站原样（禁用暗黑）"的站点
 */
(function (): void {
  'use strict';

  if (window.__dmInit) return;
  window.__dmInit = true;

  const ID_VARS = '__dm_vars__';
  const ID_STYLES = '__dm_styles__';
  const ID_FILTER = '__dm_filter__';
  const CLS_ON = 'dm-on';
  const CLS_TRANS = 'dm-transitioning';
  const CLS_MAP_SITE = 'dm-map-site';

  const DEFAULTS: DmSettings = {
    enabled: true,
    theme: 'dark',
    brightness: 100,
    contrast: 100,
    whitelist: [],
  };

  let observer: MutationObserver | null = null;
  let lastVars = '';
  let lastCss = '';
  let lastFilter = '';

  const root = (): HTMLElement => document.documentElement;

  function isMapHost(): boolean {
    let host = '';
    let path = '';
    try {
      host = (window.location.hostname || '').toLowerCase();
      path = (window.location.pathname || '').toLowerCase();
    } catch {
      return false;
    }
    if (!host) return false;
    if (/^(maps|map|ditu)\./.test(host)) return true;
    if (/\.(amap|autonavi|mapbox|here|openstreetmap)\.(com|org)$/.test(host)) return true;
    if (host === 'openstreetmap.org' || host === 'amap.com' || host === 'mapbox.com') return true;
    if (/(^|\.)(google|bing|yandex|yahoo|naver|kakao)\./.test(host) && /^\/(maps?|ditu)\b/.test(path)) return true;
    if (/\.(baidu)\.com$/.test(host) && (host.indexOf('map') !== -1 || host.indexOf('ditu') !== -1 || path.indexOf('/map') === 0)) return true;
    if (/\.(qq)\.com$/.test(host) && (host.indexOf('map') !== -1 || path.indexOf('/map') === 0)) return true;
    return false;
  }

  function updateSiteModeClasses(): void {
    root().classList.toggle(CLS_MAP_SITE, isMapHost());
  }

  // SPA 路由变化监听
  let lastHref = '';
  function watchUrlChange(): void {
    try {
      if (window.location.href === lastHref) return;
      lastHref = window.location.href;
      updateSiteModeClasses();
    } catch {
      /* ignore */
    }
  }
  try {
    window.addEventListener('popstate', watchUrlChange);
    window.addEventListener('hashchange', watchUrlChange);
    setInterval(watchUrlChange, 1500);
  } catch {
    /* ignore */
  }

  function upsertStyle(id: string, css: string): void {
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!css) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      (document.head || document.documentElement).appendChild(el);
    }
    if (el.textContent !== css) el.textContent = css;
  }

  function apply(theme: ThemeKey, brightness: number, contrast: number): void {
    const r = root();
    updateSiteModeClasses();
    r.classList.add(CLS_TRANS);
    setTimeout(() => r.classList.remove(CLS_TRANS), 350);

    lastVars = window.DM_buildVars(theme, brightness, contrast);
    lastCss = window.DM_DARK_CSS;
    lastFilter = window.DM_buildFilterCss(brightness, contrast);

    upsertStyle(ID_VARS, `:root { ${lastVars}; }`);
    upsertStyle(ID_STYLES, lastCss);
    upsertStyle(ID_FILTER, lastFilter);
    r.classList.add(CLS_ON);
    startObserver();
  }

  function remove(): void {
    const r = root();
    updateSiteModeClasses();
    r.classList.add(CLS_TRANS);
    setTimeout(() => r.classList.remove(CLS_TRANS), 350);
    r.classList.remove(CLS_ON);
    upsertStyle(ID_VARS, '');
    upsertStyle(ID_STYLES, '');
    upsertStyle(ID_FILTER, '');
    stopObserver();
  }

  function reinject(): void {
    if (!root().classList.contains(CLS_ON)) return;
    if (lastVars) upsertStyle(ID_VARS, `:root { ${lastVars}; }`);
    if (lastCss) upsertStyle(ID_STYLES, lastCss);
    if (lastFilter) upsertStyle(ID_FILTER, lastFilter);
  }

  function startObserver(): void {
    if (observer) return;
    observer = new MutationObserver(() => {
      if (
        root().classList.contains(CLS_ON) &&
        (!document.getElementById(ID_STYLES) || !document.getElementById(ID_VARS))
      ) {
        reinject();
      }
    });
    const head = document.head || document.documentElement;
    observer.observe(head, { childList: true });
    if (document.documentElement !== head) {
      observer.observe(document.documentElement, {
        childList: true,
        attributes: true,
        attributeFilter: ['class'],
      });
    }
  }

  function stopObserver(): void {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function isWhitelisted(whitelist: string[] | undefined): boolean {
    try {
      const origin = window.location.origin;
      return (whitelist || []).indexOf(origin) !== -1;
    } catch {
      return false;
    }
  }

  function normalize(input: Partial<DmSettings> | null | undefined): DmSettings {
    const s = input || {};
    return {
      enabled: typeof s.enabled === 'boolean' ? s.enabled : DEFAULTS.enabled,
      theme: (s.theme as ThemeKey) || DEFAULTS.theme,
      brightness: typeof s.brightness === 'number' ? s.brightness : DEFAULTS.brightness,
      contrast: typeof s.contrast === 'number' ? s.contrast : DEFAULTS.contrast,
      whitelist: Array.isArray(s.whitelist) ? s.whitelist : [],
    };
  }

  function init(input: Partial<DmSettings> | null | undefined): void {
    const s = normalize(input);
    if (!s.enabled || isWhitelisted(s.whitelist)) {
      remove();
      return;
    }
    apply(s.theme, s.brightness, s.contrast);
  }

  try {
    chrome.storage.local.get(['dmSettings'], (result: { dmSettings?: DmSettings }) => {
      init(result && result.dmSettings);
    });
  } catch {
    init(DEFAULTS);
  }

  // storage 变化时即时响应
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes.dmSettings) return;
      init(changes.dmSettings.newValue as DmSettings | undefined);
    });
  } catch {
    /* ignore */
  }

  // 兼容消息通道
  try {
    chrome.runtime.onMessage.addListener((msg: DmMessage, _sender, sendResponse) => {
      if (!msg || !msg.type) return;
      if (msg.type === 'DM_APPLY') {
        init(msg.settings);
        try { sendResponse({ ok: true }); } catch { /* ignore */ }
      } else if (msg.type === 'DM_REMOVE') {
        remove();
        try { sendResponse({ ok: true }); } catch { /* ignore */ }
      }
      return true;
    });
  } catch {
    /* ignore */
  }
})();
