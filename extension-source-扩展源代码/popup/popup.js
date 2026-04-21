(function () {
  'use strict';

  var DEFAULTS = { enabled: true, theme: 'dark', brightness: 100, contrast: 100, whitelist: [] };
  var _settings = null;
  var _currentOrigin = '';

  function $(id) { return document.getElementById(id); }

  function safeSendMessage(tabId, payload) {
    try {
      var ret = chrome.tabs.sendMessage(tabId, payload, function () {
        void chrome.runtime.lastError;
      });
      if (ret && typeof ret.catch === 'function') ret.catch(function () {});
    } catch (e) { /* ignore */ }
  }

  // 向所有可注入脚本的 tab 广播（保证跨标签实时生效）
  function broadcast() {
    try {
      chrome.tabs.query({}, function (tabs) {
        if (!tabs) return;
        var payload = {
          type: _settings.enabled ? 'DM_APPLY' : 'DM_REMOVE',
          settings: _settings
        };
        tabs.forEach(function (tab) {
          if (tab && tab.id != null) safeSendMessage(tab.id, payload);
        });
      });
    } catch (e) { /* ignore */ }
  }

  function save(broadcastAfter) {
    try {
      chrome.storage.local.set({ dmSettings: _settings }, function () {
        void chrome.runtime.lastError;
        if (broadcastAfter !== false) broadcast();
      });
    } catch (e) {
      if (broadcastAfter !== false) broadcast();
    }
  }

  function renderToggle() {
    var btn = $('toggle');
    btn.classList.toggle('on', !!_settings.enabled);
    $('toggleText').textContent = _settings.enabled ? '已开启（点击关闭）' : '已关闭（点击开启）';
  }

  function renderThemes() {
    document.querySelectorAll('.theme').forEach(function (el) {
      el.classList.toggle('active', el.dataset.theme === _settings.theme);
    });
  }

  function renderSliders() {
    $('bright').value = _settings.brightness;
    $('brightVal').textContent = _settings.brightness + '%';
    $('contrast').value = _settings.contrast;
    $('contrastVal').textContent = _settings.contrast + '%';
  }

  function loadSettings() {
    chrome.storage.local.get(['dmSettings'], function (result) {
      _settings = (result && result.dmSettings) ? result.dmSettings : JSON.parse(JSON.stringify(DEFAULTS));
      if (typeof _settings.enabled !== 'boolean') _settings.enabled = true;
      if (!_settings.theme) _settings.theme = 'dark';
      if (typeof _settings.brightness !== 'number') _settings.brightness = 100;
      if (typeof _settings.contrast !== 'number') _settings.contrast = 100;
      if (!Array.isArray(_settings.whitelist)) _settings.whitelist = [];

      renderToggle();
      renderThemes();
      renderSliders();
      updateSite();
    });
  }

  function updateSite() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var label = $('siteLabel');
      var status = $('siteStatus');
      if (!tabs || !tabs[0] || !tabs[0].url) {
        label.textContent = '—';
        status.textContent = '—';
        status.className = 'site-badge off';
        _currentOrigin = '';
        return;
      }
      try {
        var url = new URL(tabs[0].url);
        _currentOrigin = url.origin;
        label.textContent = url.hostname;
        var isWhitelisted = _settings.whitelist.indexOf(_currentOrigin) !== -1;
        status.textContent = isWhitelisted ? '已禁用' : '已启用';
        status.className = 'site-badge ' + (isWhitelisted ? 'off' : 'on');
      } catch (e) {
        label.textContent = '—';
        status.textContent = '—';
        status.className = 'site-badge off';
        _currentOrigin = '';
      }
    });
  }

  // —— 事件绑定 ——
  $('toggle').addEventListener('click', function () {
    _settings.enabled = !_settings.enabled;
    renderToggle();
    save();
  });

  document.querySelectorAll('.theme').forEach(function (el) {
    el.addEventListener('click', function () {
      _settings.theme = el.dataset.theme;
      renderThemes();
      save();
    });
  });

  $('bright').addEventListener('input', function (e) {
    _settings.brightness = parseInt(e.target.value, 10) || 100;
    $('brightVal').textContent = _settings.brightness + '%';
    save();
  });

  $('contrast').addEventListener('input', function (e) {
    _settings.contrast = parseInt(e.target.value, 10) || 100;
    $('contrastVal').textContent = _settings.contrast + '%';
    save();
  });

  $('siteRow').addEventListener('click', function () {
    if (!_currentOrigin) return;
    var wl = _settings.whitelist.slice();
    var idx = wl.indexOf(_currentOrigin);
    if (idx !== -1) wl.splice(idx, 1); else wl.push(_currentOrigin);
    _settings.whitelist = wl;
    save();
    updateSite();
  });

  loadSettings();
})();
