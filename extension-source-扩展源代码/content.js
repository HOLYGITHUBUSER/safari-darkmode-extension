// 检查是否启用暗黑模式
function checkDarkMode() {
  chrome.storage.sync.get(['darkModeEnabled', 'darkModeIntensity'], function(result) {
    if (result.darkModeEnabled !== false) {
      enableDarkMode(result.darkModeIntensity || 0.9);
    }
  });
}

// 检测页面背景色
function detectPageBrightness() {
  const body = document.body;
  if (!body) return 0.9;
  
  const computedStyle = window.getComputedStyle(body);
  const bgColor = computedStyle.backgroundColor;
  
  // 解析 RGB 值
  const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    // 计算亮度
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    // 如果页面已经是暗色，降低反转强度
    return brightness < 128 ? 0.7 : 0.9;
  }
  
  return 0.9;
}

// 网站黑名单
const blacklist = [
  'youtube.com',
  'netflix.com',
  'bilibili.com'
];

// 检查是否在黑名单中
function isBlacklisted() {
  const hostname = window.location.hostname;
  return blacklist.some(domain => hostname.includes(domain));
}

// 动态设置 CSS 变量
function setDarkModeIntensity(intensity) {
  const root = document.documentElement;
  root.style.setProperty('--darkmode-invert', intensity);
  root.style.setProperty('--darkmode-brightness', 105 + (1 - intensity) * 20);
}

// 启用暗黑模式
function enableDarkMode(intensity) {
  if (isBlacklisted()) {
    console.log('Site is blacklisted, skipping dark mode');
    return;
  }
  
  const detectedIntensity = detectPageBrightness();
  const finalIntensity = intensity || detectedIntensity;
  
  document.documentElement.classList.add('dark-mode-active');
  setDarkModeIntensity(finalIntensity);
  
  // 动态调整特定元素
  adjustSpecificElements();
}

// 禁用暗黑模式
function disableDarkMode() {
  document.documentElement.classList.remove('dark-mode-active');
  document.documentElement.style.removeProperty('--darkmode-invert');
  document.documentElement.style.removeProperty('--darkmode-brightness');
}

// 调整特定元素
function adjustSpecificElements() {
  // 避免处理 iframe 内容
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    try {
      if (iframe.contentDocument) {
        iframe.contentDocument.documentElement.classList.add('dark-mode-active');
      }
    } catch (e) {
      // 跨域 iframe，忽略
    }
  });
}

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleDarkMode') {
    if (request.enabled) {
      enableDarkMode(request.intensity);
    } else {
      disableDarkMode();
    }
  } else if (request.action === 'updateIntensity') {
    if (document.documentElement.classList.contains('dark-mode-active')) {
      setDarkModeIntensity(request.intensity);
    }
  }
});

// 页面加载时检查状态
checkDarkMode();
