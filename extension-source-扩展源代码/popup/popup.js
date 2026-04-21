(function() {
  var DEFAULTS = { enabled: true, theme: 'dark', brightness: 100, contrast: 100, whitelist: [] };
  var _settings = null;
  var _currentOrigin = '';

  function loadSettings() {
    chrome.storage.local.get(['dmSettings'], function(result) {
      _settings = result.dmSettings || JSON.parse(JSON.stringify(DEFAULTS));
      document.getElementById('toggle').checked = _settings.enabled;
      document.getElementById('status').textContent = _settings.enabled ? 'ON' : 'OFF';
      document.getElementById('status').className = 'status ' + (_settings.enabled ? 'on' : 'off');
      document.querySelectorAll('.theme').forEach(function(el) {
        el.classList.toggle('active', el.dataset.theme === _settings.theme);
      });
      document.getElementById('bright').value = _settings.brightness;
      document.getElementById('brightVal').textContent = _settings.brightness + '%';
      document.getElementById('contrast').value = _settings.contrast;
      document.getElementById('contrastVal').textContent = _settings.contrast + '%';
      updateSite();
    });
  }

  function saveSettings() {
    chrome.storage.local.set({ dmSettings: _settings });
  }

  function sendToTabs() {
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

  function updateSite() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var label = document.getElementById('siteLabel');
      var status = document.getElementById('siteStatus');
      if (!tabs[0] || !tabs[0].url) {
        label.textContent = '—';
        status.className = 'status off';
        return;
      }
      try {
        var url = new URL(tabs[0].url);
        _currentOrigin = url.origin;
        label.textContent = url.hostname;
        var isWhitelisted = (_settings.whitelist || []).indexOf(_currentOrigin) !== -1;
        status.textContent = isWhitelisted ? 'OFF' : 'ON';
        status.className = 'status ' + (isWhitelisted ? 'off' : 'on');
      } catch (e) {
        label.textContent = '—';
        status.className = 'status off';
      }
    });
  }

  document.getElementById('toggle').addEventListener('change', function(e) {
    _settings.enabled = e.target.checked;
    document.getElementById('status').textContent = _settings.enabled ? 'ON' : 'OFF';
    document.getElementById('status').className = 'status ' + (_settings.enabled ? 'on' : 'off');
    saveSettings();
    sendToTabs();
  });

  document.querySelectorAll('.theme').forEach(function(el) {
    el.addEventListener('click', function() {
      _settings.theme = el.dataset.theme;
      document.querySelectorAll('.theme').forEach(function(t) { t.classList.remove('active'); });
      el.classList.add('active');
      saveSettings();
      if (_settings.enabled) sendToTabs();
    });
  });

  document.getElementById('bright').addEventListener('input', function(e) {
    _settings.brightness = parseInt(e.target.value);
    document.getElementById('brightVal').textContent = _settings.brightness + '%';
    saveSettings();
    if (_settings.enabled) sendToTabs();
  });

  document.getElementById('contrast').addEventListener('input', function(e) {
    _settings.contrast = parseInt(e.target.value);
    document.getElementById('contrastVal').textContent = _settings.contrast + '%';
    saveSettings();
    if (_settings.enabled) sendToTabs();
  });

  document.getElementById('siteStatus').addEventListener('click', function() {
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
    updateSite();
    sendToActiveTab();
  });

  loadSettings();
})();
