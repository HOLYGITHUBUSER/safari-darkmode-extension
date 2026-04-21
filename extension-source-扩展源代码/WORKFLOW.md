# 网站适配开发工作流

## 开发流程

### 1. 准备工作

```bash
cd extension-source-扩展源代码
npm install
npm run build
```

### 2. 添加新网站适配

#### 步骤 1：创建网站规则
在 `src/site-rules.ts` 中添加新网站规则：

```typescript
export const siteRules: SiteRule[] = [
  {
    name: 'Twitter',
    domains: ['twitter.com', 'x.com'],
    priority: 'high',
    css: `
      /* Twitter 特定样式 */
      .dm-on [data-testid="primaryColumn"] {
        background: #1a1a1a !important;
      }
    `,
    notes: '社交媒体平台'
  }
];
```

#### 步骤 2：本地测试
1. 在 Safari 中加载扩展（开发者模式）
2. 打开目标网站
3. 启用暗黑模式
4. 检查适配效果

#### 步骤 3：调整样式
- 使用 Safari 开发者工具（Cmd+Option+I）
- 实时调整 CSS 规则
- 将调整后的规则复制到 `site-rules.ts`

#### 步骤 4：提交代码
```bash
git add src/site-rules.ts
git commit -m "适配 Twitter 网站暗黑模式"
git push
```

## 测试流程

### 自动化测试

#### 1. 创建测试用例
在 `tests/site-adaptation/` 下创建测试文件：

```typescript
// tests/site-adaptation/twitter.test.ts
import { test, expect } from '@playwright/test';

test('Twitter 暗黑模式适配', async ({ page }) => {
  await page.goto('https://twitter.com');
  
  // 启用暗黑模式
  await page.evaluate(() => {
    document.documentElement.classList.add('dm-on');
  });
  
  // 检查关键元素
  const primaryColumn = page.locator('[data-testid="primaryColumn"]');
  const bgColor = await primaryColumn.evaluate(el => 
    window.getComputedStyle(el).backgroundColor
  );
  
  // 验证背景是深色
  expect(bgColor).toBe('rgb(26, 26, 26)');
});
```

#### 2. 运行测试
```bash
npm run test
```

#### 3. 视觉回归测试
```bash
npm run test:visual
```

## 审核清单

### 网站适配审核标准

#### 必须检查项：
- [ ] **可读性**：文本与背景对比度足够（WCAG AA 标准）
- [ ] **颜色正确性**：主要元素颜色正确，无异常
- [ ] **交互元素**：按钮、链接、表单可正常使用
- [ ] **图片显示**：图片颜色正确，未被过度反转
- [ ] **视频显示**：视频颜色正常
- [ ] **布局完整性**：页面布局未破坏
- [ ] **性能影响**：页面加载速度无明显下降
- [ ] **移动端适配**：移动设备上显示正常

#### 特殊情况检查：
- [ ] **地图站点**：地图瓦片显示正确
- [ ] **Canvas 元素**：Canvas 渲染正常
- [ ] **SVG 图标**：SVG 颜色正确
- [ ] **动态内容**：动态加载内容适配正确

#### 用户体验检查：
- [ ] **主题切换**：主题切换流畅
- [ ] **亮度对比度**：调节功能正常
- [ ] **白名单**：添加/移除白名单功能正常
- [ ] **设置保存**：设置正确保存和恢复

### 审核流程

#### 1. 开发者自审
- 按照审核清单逐项检查
- 使用不同浏览器测试（Safari, Chrome, Edge）
- 测试不同页面（首页、详情页、列表页等）

#### 2. 代码审查
- 提交 Pull Request
- 其他开发者审查代码
- 检查代码质量和安全性

#### 3. 自动化测试
- CI/CD 自动运行测试
- 检查测试通过率
- 查看视觉回归测试结果

#### 4. 人工审核
- 在实际环境中测试
- 邀请用户测试反馈
- 收集并修复问题

#### 5. 发布
- 合并到主分支
- 发布新版本
- 更新文档

## 辅助工具

### 1. 本地测试脚本

创建 `scripts/test-site.ts` 快速测试单个网站：

```typescript
import { chromium } from 'playwright';

async function testSite(url: string) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto(url);
  await page.screenshot({ path: 'before.png' });
  
  // 注入扩展
  await page.addInitScript({
    path: './src/content.js'
  });
  
  await page.reload();
  await page.screenshot({ path: 'after.png' });
  
  await browser.close();
}

testSite('https://twitter.com');
```

### 2. 批量测试脚本

创建 `scripts/batch-test.ts` 批量测试多个网站：

```typescript
const sites = [
  'https://twitter.com',
  'https://github.com',
  'https://reddit.com'
];

for (const site of sites) {
  console.log(`Testing ${site}...`);
  await testSite(site);
}
```

### 3. 审核报告模板

创建 `templates/audit-report.md`：

```markdown
# 网站适配审核报告

**网站名称**：Twitter
**网站 URL**：https://twitter.com
**适配版本**：v2.0.0
**审核日期**：2026-04-22

## 审核结果

### 必须检查项
- [x] 可读性
- [x] 颜色正确性
- [ ] 交互元素
- [ ] 图片显示
...

### 发现的问题
1. 按钮颜色不够明显
2. 某些图片过度反转

### 建议修复
1. 调整按钮背景色为 #3a3a3a
2. 为图片添加特殊规则

## 结论
[ ] 通过
[ ] 需要修改
[ ] 不通过
```

## 常见问题

### Q: 如何调试 CSS 规则？
A: 使用 Safari 开发者工具，在 Elements 面板中实时修改样式。

### Q: 如何处理动态加载的内容？
A: 使用 MutationObserver 监听 DOM 变化，在内容加载后重新应用样式。

### Q: 如何测试移动端适配？
A: 使用 Playwright 的移动设备模拟功能：
```typescript
const iPhone = playwright.devices['iPhone 12'];
const context = await browser.newContext({ ...iPhone });
```

### Q: 如何回滚有问题的适配？
A: 使用 Git 回滚到之前的提交：
```bash
git revert <commit-hash>
```

## 最佳实践

1. **渐进式适配**：先完成通用规则，再添加网站特定规则
2. **保持简单**：优先使用简单的 CSS 规则，避免复杂的 JavaScript 逻辑
3. **性能优先**：避免使用过多的选择器和复杂的 CSS
4. **测试驱动**：先写测试，再实现功能
5. **文档更新**：每次适配后更新文档
6. **版本控制**：使用 Git 管理所有代码变更
