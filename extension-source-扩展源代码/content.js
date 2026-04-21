// 检查是否启用暗黑模式
function checkDarkMode() {
  chrome.storage.sync.get(['darkModeEnabled'], function(result) {
    if (result.darkModeEnabled !== false) {
      enableDarkMode();
    }
  });
}

// 启用暗黑模式
function enableDarkMode() {
  document.documentElement.classList.add('dark-mode-active');
}

// 禁用暗黑模式
function disableDarkMode() {
  document.documentElement.classList.remove('dark-mode-active');
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleDarkMode') {
    if (request.enabled) {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  }
});

// 页面加载时检查状态
checkDarkMode();
