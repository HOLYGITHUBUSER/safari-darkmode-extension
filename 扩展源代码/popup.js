// 获取当前状态
chrome.storage.sync.get(['darkModeEnabled'], function(result) {
  const toggle = document.getElementById('darkModeToggle');
  // 默认启用
  toggle.checked = result.darkModeEnabled !== false;
});

// 切换暗黑模式
document.getElementById('darkModeToggle').addEventListener('change', function(e) {
  const enabled = e.target.checked;
  
  // 保存状态
  chrome.storage.sync.set({ darkModeEnabled: enabled }, function() {
    // 通知所有标签页更新
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleDarkMode',
          enabled: enabled
        }).catch(() => {
          // 忽略无法发送消息的标签页
        });
      });
    });
  });
});
