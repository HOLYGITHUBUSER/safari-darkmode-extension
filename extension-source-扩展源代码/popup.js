// 获取当前状态
chrome.storage.sync.get(['darkModeEnabled', 'darkModeIntensity'], function(result) {
  const toggle = document.getElementById('darkModeToggle');
  const slider = document.getElementById('intensitySlider');
  const intensityValue = document.getElementById('intensityValue');
  
  // 默认启用
  toggle.checked = result.darkModeEnabled !== false;
  
  // 设置强度值
  const intensity = result.darkModeIntensity || 90;
  slider.value = intensity;
  intensityValue.textContent = intensity + '%';
});

// 切换暗黑模式
document.getElementById('darkModeToggle').addEventListener('change', function(e) {
  const enabled = e.target.checked;
  const slider = document.getElementById('intensitySlider');
  const intensity = parseInt(slider.value) / 100;
  
  // 保存状态
  chrome.storage.sync.set({ darkModeEnabled: enabled, darkModeIntensity: parseInt(slider.value) }, function() {
    // 通知所有标签页更新
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleDarkMode',
          enabled: enabled,
          intensity: intensity
        }).catch(() => {
          // 忽略无法发送消息的标签页
        });
      });
    });
  });
});

// 强度滑块变化
document.getElementById('intensitySlider').addEventListener('input', function(e) {
  const intensity = e.target.value;
  document.getElementById('intensityValue').textContent = intensity + '%';
  
  // 保存强度值
  chrome.storage.sync.set({ darkModeIntensity: parseInt(intensity) });
  
  // 实时更新当前标签页
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateIntensity',
        intensity: parseInt(intensity) / 100
      }).catch(() => {
        // 忽略无法发送消息的标签页
      });
    }
  });
});
