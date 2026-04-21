/**
 * popup.js — 弹出面板逻辑
 */

(function() {
  'use strict';

  var DEFAULTS = {
    enabled: true,
    theme: 'dark',
    brightness: 100,
    contrast: 100,
    autoMode: false,
    whitelist: []
  };

  var _settings = null;
  var _currentOrigin = '';

  // 标签切换
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // 加载设置
  function loadSettings() {
    chrome.storage.local.get(['dmSettings'], function(result) {
      _settings = result.dmSettings || JSON.parse(JSON.stringify(DEFAULTS));

      // 主控
      document.getElementById('toggleSwitch').checked = _settings.enabled;
      document.getElementById('autoModeSwitch').checked = _settings.autoMode || false;
      updateStatusBadge();

      // 主题
      document.querySelectorAll('.theme-card').forEach(function(card) {
        card.classList.toggle('active', card.dataset.theme === _settings.theme);
      });

      // 调节
      document.getElementById('brightnessSlider').value = _settings.brightness;
      document.getElementById('brightnessVal').textContent = _settings.brightness + '%';
      document.getElementById('contrastSlider').value = _settings.contrast;
      document.getElementById('contrastVal').textContent = _settings.contrast + '%';

      // 网站
      updateSitePanel();
    });
  }

  function updateStatusBadge() {
    var badge = document.getElementById('mainStatus');
    if (_settings.enabled) {
      badge.textContent = 'ON';
      badge.className = 'status-badge status-on';
    } else {
      badge.textContent = 'OFF';
      badge.className = 'status-badge status-off';
    }
  }

  function saveSettings() {
    chrome.storage.local.set({ dmSettings: _settings });
  }

  function sendToAllTabs() {
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: _settings.enabled ? 'DM_APPLY' : 'DM_REMOVE',
            settings: _settings
          }).catch(function() {});
        }
      });
    });
  }

  function sendToActiveTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: _settings.enabled ? 'DM_APPLY' : 'DM_REMOVE',
          settings: _settings
        }).catch(function() {});
      }
    });
  }

  // 主控开关
  document.getElementById('toggleSwitch').addEventListener('change', function(e) {
    _settings.enabled = e.target.checked;
    saveSettings();
    sendToAllTabs();
    updateStatusBadge();
  });

  // 自动模式
  document.getElementById('autoModeSwitch').addEventListener('change', function(e) {
    _settings.autoMode = e.target.checked;
    saveSettings();
  });

  // 主题选择
  document.querySelectorAll('.theme-card').forEach(function(card) {
    card.addEventListener('click', function() {
      _settings.theme = card.dataset.theme;
      document.querySelectorAll('.theme-card').forEach(function(c) { c.classList.remove('active'); });
      card.classList.add('active');
      saveSettings();
      if (_settings.enabled) sendToAllTabs();
    });
  });

  // 亮度/对比度
  document.getElementById('brightnessSlider').addEventListener('input', function(e) {
    _settings.brightness = parseInt(e.target.value);
    document.getElementById('brightnessVal').textContent = _settings.brightness + '%';
    saveSettings();
    if (_settings.enabled) sendToAllTabs();
  });

  document.getElementById('contrastSlider').addEventListener('input', function(e) {
    _settings.contrast = parseInt(e.target.value);
    document.getElementById('contrastVal').textContent = _settings.contrast + '%';
    saveSettings();
    if (_settings.enabled) sendToAllTabs();
  });

  // 网站面板
  function updateSitePanel() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var toggle = document.getElementById('currentSiteToggle');
      if (!tabs[0] || !tabs[0].url) {
        toggle.textContent = '—';
        toggle.className = 'site-toggle';
        return;
      }

      try {
        var url = new URL(tabs[0].url);
        _currentOrigin = url.origin;
        var isWhitelisted = (_settings.whitelist || []).indexOf(_currentOrigin) !== -1;

        toggle.textContent = isWhitelisted ? '已禁用' : '启用';
        toggle.className = isWhitelisted ? 'site-toggle site-disabled' : 'site-toggle site-enabled';
      } catch (e) {
        toggle.textContent = '—';
        toggle.className = 'site-toggle';
      }
    });
  }

  document.getElementById('currentSiteToggle').addEventListener('click', function() {
    if (!_currentOrigin) return;

    var whitelist = _settings.whitelist || [];
    var idx = whitelist.indexOf(_currentOrigin);

    if (idx !== -1) {
      whitelist.splice(idx, 1);
    } else {
      whitelist.push(_currentOrigin);
    }

    _settings.whitelist = whitelist;
    saveSettings();
    updateSitePanel();
    sendToActiveTab();
  });

  // 初始化
  loadSettings();
})();
