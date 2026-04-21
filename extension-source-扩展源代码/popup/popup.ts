/**
 * popup.ts —— 弹出面板逻辑
 */
(function (): void {
  'use strict';

  const DEFAULTS: DmSettings = {
    enabled: true,
    theme: 'dark',
    brightness: 100,
    contrast: 100,
    whitelist: [],
  };

  let settings: DmSettings = { ...DEFAULTS };
  let currentOrigin = '';

  function $(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing element #${id}`);
    return el;
  }

  function safeSendMessage(tabId: number, payload: DmMessage): void {
    try {
      // Chrome 回调签名返回 void；Firefox/Safari 某些版本返回 Promise——都在此处静默吞掉错误
      const ret: unknown = (chrome.tabs.sendMessage as unknown as (
        id: number,
        msg: DmMessage,
        cb: () => void,
      ) => unknown)(tabId, payload, () => {
        void chrome.runtime.lastError;
      });
      if (ret && typeof (ret as Promise<unknown>).catch === 'function') {
        (ret as Promise<unknown>).catch(() => {});
      }
    } catch {
      /* ignore */
    }
  }

  function broadcast(): void {
    try {
      chrome.tabs.query({}, (tabs) => {
        if (!tabs) return;
        const payload: DmMessage = settings.enabled
          ? { type: 'DM_APPLY', settings }
          : { type: 'DM_REMOVE' };
        tabs.forEach((tab) => {
          if (tab && tab.id != null) safeSendMessage(tab.id, payload);
        });
      });
    } catch {
      /* ignore */
    }
  }

  function save(broadcastAfter: boolean = true): void {
    try {
      chrome.storage.local.set({ dmSettings: settings }, () => {
        void chrome.runtime.lastError;
        if (broadcastAfter) broadcast();
      });
    } catch {
      if (broadcastAfter) broadcast();
    }
  }

  function renderToggle(): void {
    const btn = $('toggle');
    btn.classList.toggle('on', settings.enabled);
    $('toggleText').textContent = settings.enabled ? '已开启（点击关闭）' : '已关闭（点击开启）';
  }

  function renderThemes(): void {
    document.querySelectorAll<HTMLElement>('.theme').forEach((el) => {
      el.classList.toggle('active', el.dataset.theme === settings.theme);
    });
  }

  function renderSliders(): void {
    ($('bright') as HTMLInputElement).value = String(settings.brightness);
    $('brightVal').textContent = `${settings.brightness}%`;
    ($('contrast') as HTMLInputElement).value = String(settings.contrast);
    $('contrastVal').textContent = `${settings.contrast}%`;
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

  function loadSettings(): void {
    chrome.storage.local.get(['dmSettings'], (result: { dmSettings?: DmSettings }) => {
      settings = normalize(result && result.dmSettings);
      renderToggle();
      renderThemes();
      renderSliders();
      updateSite();
    });
  }

  function updateSite(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const label = $('siteLabel');
      const status = $('siteStatus');
      const tab = tabs && tabs[0];
      if (!tab || !tab.url) {
        label.textContent = '—';
        status.textContent = '—';
        status.className = 'site-badge off';
        currentOrigin = '';
        return;
      }
      try {
        const url = new URL(tab.url);
        currentOrigin = url.origin;
        label.textContent = url.hostname;
        const inWhitelist = settings.whitelist.indexOf(currentOrigin) !== -1;
        status.textContent = inWhitelist ? '已禁用' : '已启用';
        status.className = `site-badge ${inWhitelist ? 'off' : 'on'}`;
      } catch {
        label.textContent = '—';
        status.textContent = '—';
        status.className = 'site-badge off';
        currentOrigin = '';
      }
    });
  }

  // —— 事件绑定 ——
  $('toggle').addEventListener('click', () => {
    settings.enabled = !settings.enabled;
    renderToggle();
    save();
  });

  document.querySelectorAll<HTMLElement>('.theme').forEach((el) => {
    el.addEventListener('click', () => {
      const theme = el.dataset.theme as ThemeKey | undefined;
      if (!theme) return;
      settings.theme = theme;
      renderThemes();
      save();
    });
  });

  $('bright').addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    settings.brightness = parseInt(target.value, 10) || 100;
    $('brightVal').textContent = `${settings.brightness}%`;
    save();
  });

  $('contrast').addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    settings.contrast = parseInt(target.value, 10) || 100;
    $('contrastVal').textContent = `${settings.contrast}%`;
    save();
  });

  $('siteRow').addEventListener('click', () => {
    if (!currentOrigin) return;
    const wl = settings.whitelist.slice();
    const idx = wl.indexOf(currentOrigin);
    if (idx !== -1) wl.splice(idx, 1);
    else wl.push(currentOrigin);
    settings.whitelist = wl;
    save();
    updateSite();
  });

  loadSettings();
})();
