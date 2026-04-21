"use strict";
/**
 * popup.ts —— 弹出面板逻辑
 */
(function () {
    'use strict';
    const DEFAULTS = {
        enabled: true,
        theme: 'dark',
        brightness: 100,
        contrast: 100,
        whitelist: [],
    };
    let settings = Object.assign({}, DEFAULTS);
    let currentOrigin = '';
    function $(id) {
        const el = document.getElementById(id);
        if (!el)
            throw new Error(`Missing element #${id}`);
        return el;
    }
    function safeSendMessage(tabId, payload) {
        try {
            // Chrome 回调签名返回 void；Firefox/Safari 某些版本返回 Promise——都在此处静默吞掉错误
            const ret = chrome.tabs.sendMessage(tabId, payload, () => {
                void chrome.runtime.lastError;
            });
            if (ret && typeof ret.catch === 'function') {
                ret.catch(() => { });
            }
        }
        catch (_a) {
            /* ignore */
        }
    }
    function broadcast() {
        try {
            chrome.tabs.query({}, (tabs) => {
                if (!tabs)
                    return;
                const payload = settings.enabled
                    ? { type: 'DM_APPLY', settings }
                    : { type: 'DM_REMOVE' };
                tabs.forEach((tab) => {
                    if (tab && tab.id != null)
                        safeSendMessage(tab.id, payload);
                });
            });
        }
        catch (_a) {
            /* ignore */
        }
    }
    function save(broadcastAfter = true) {
        try {
            chrome.storage.local.set({ dmSettings: settings }, () => {
                void chrome.runtime.lastError;
                if (broadcastAfter)
                    broadcast();
            });
        }
        catch (_a) {
            if (broadcastAfter)
                broadcast();
        }
    }
    function renderToggle() {
        const btn = $('toggle');
        btn.classList.toggle('on', settings.enabled);
        $('toggleText').textContent = settings.enabled ? '已开启（点击关闭）' : '已关闭（点击开启）';
    }
    function renderThemes() {
        document.querySelectorAll('.theme').forEach((el) => {
            el.classList.toggle('active', el.dataset.theme === settings.theme);
        });
    }
    function renderSliders() {
        $('bright').value = String(settings.brightness);
        $('brightVal').textContent = `${settings.brightness}%`;
        $('contrast').value = String(settings.contrast);
        $('contrastVal').textContent = `${settings.contrast}%`;
    }
    function normalize(input) {
        const s = input || {};
        return {
            enabled: typeof s.enabled === 'boolean' ? s.enabled : DEFAULTS.enabled,
            theme: s.theme || DEFAULTS.theme,
            brightness: typeof s.brightness === 'number' ? s.brightness : DEFAULTS.brightness,
            contrast: typeof s.contrast === 'number' ? s.contrast : DEFAULTS.contrast,
            whitelist: Array.isArray(s.whitelist) ? s.whitelist : [],
        };
    }
    function loadSettings() {
        chrome.storage.local.get(['dmSettings'], (result) => {
            settings = normalize(result && result.dmSettings);
            renderToggle();
            renderThemes();
            renderSliders();
            updateSite();
        });
    }
    function updateSite() {
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
            }
            catch (_a) {
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
    document.querySelectorAll('.theme').forEach((el) => {
        el.addEventListener('click', () => {
            const theme = el.dataset.theme;
            if (!theme)
                return;
            settings.theme = theme;
            renderThemes();
            save();
        });
    });
    $('bright').addEventListener('input', (e) => {
        const target = e.target;
        settings.brightness = parseInt(target.value, 10) || 100;
        $('brightVal').textContent = `${settings.brightness}%`;
        save();
    });
    $('contrast').addEventListener('input', (e) => {
        const target = e.target;
        settings.contrast = parseInt(target.value, 10) || 100;
        $('contrastVal').textContent = `${settings.contrast}%`;
        save();
    });
    $('siteRow').addEventListener('click', () => {
        if (!currentOrigin)
            return;
        const wl = settings.whitelist.slice();
        const idx = wl.indexOf(currentOrigin);
        if (idx !== -1)
            wl.splice(idx, 1);
        else
            wl.push(currentOrigin);
        settings.whitelist = wl;
        save();
        updateSite();
    });
    loadSettings();
})();
