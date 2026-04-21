import fs from 'fs';
import { URL } from 'url';

const historyFile = '/Users/jl/Downloads/BrowserHistory_2026_4_22.csv';
const content = fs.readFileSync(historyFile, 'utf-8');

const lines = content.split('\n').slice(1); // 跳过标题行
const domainCounts = {};
const urlCounts = {};

for (const line of lines) {
  if (!line.trim()) continue;
  
  const parts = line.split(',');
  if (parts.length < 2) continue;
  
  const url = parts[1].replace(/"/g, '');
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // 统计域名
    if (domain) {
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    }
    
    // 统计完整URL（排除localhost）
    if (!url.includes('localhost')) {
      urlCounts[url] = (urlCounts[url] || 0) + 1;
    }
  } catch {
    // 忽略无效URL
  }
}

// 按访问次数排序
const sortedDomains = Object.entries(domainCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30); // 取前30个

const sortedUrls = Object.entries(urlCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);

console.log('=== 域名访问频率（前30）===');
for (const [domain, count] of sortedDomains) {
  console.log(`${domain}: ${count} 次`);
}

console.log('\n=== URL访问频率（前30，排除localhost）===');
for (const [url, count] of sortedUrls) {
  console.log(`${url}: ${count} 次`);
}

// 保存结果
const result = {
  domains: sortedDomains.map(([domain, count]) => ({ domain, count })),
  urls: sortedUrls.map(([url, count]) => ({ url, count }))
};

fs.writeFileSync(
  '/Users/jl/AAAProgram/safari-darkmode-extension-项目/extension-source-扩展源代码/scripts/history-analysis.json',
  JSON.stringify(result, null, 2)
);

console.log('\n分析结果已保存到 history-analysis.json');
