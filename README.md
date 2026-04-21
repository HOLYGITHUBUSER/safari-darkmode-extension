# Safari 全局暗黑模式扩展

为所有网页应用暗黑模式的浏览器扩展（Safari / Chrome / Edge 通用 Manifest V2）。

## 功能特性

- ✅ 全局暗黑模式，支持 4 套主题（Dark / Sepia / Midnight / Forest）
- ✅ 亮度、对比度独立调节
- ✅ 当前站点白名单（一键禁用某站）
- ✅ 地图站点专用适配（Google Maps、高德、百度、Leaflet、Mapbox、OpenLayers 等）
- ✅ 设置自动保存，跨标签页实时同步
- ✅ 一键开关，方便切换

## 项目结构

```
safari-darkmode-extension-项目/
├── extension-source-扩展源代码/    # 扩展源代码（TypeScript）
│   ├── manifest.json              # 扩展配置文件（必需）
│   ├── tsconfig.json              # TypeScript 配置（必需）
│   ├── package.json               # 依赖配置（必需）
│   ├── .gitignore                 # Git 忽略规则（必需）
│   ├── src/                       # 内容脚本源码（必需）
│   │   ├── content.ts             # 内容脚本主逻辑
│   │   ├── themes.ts              # 主题定义和 CSS 生成
│   │   └── types.d.ts             # TypeScript 类型定义
│   ├── popup/                     # 弹出界面（必需）
│   │   ├── popup.html             # 弹出面板 HTML
│   │   └── popup.ts               # 弹出面板逻辑
│   ├── css/                       # 样式文件（必需）
│   │   └── darkmode.css           # 占位样式（实际规则由 content.ts 注入）
│   └── icons/                     # 扩展图标（必需）
│       ├── icon16.png             # 16x16 图标
│       ├── icon48.png             # 48x48 图标
│       └── icon128.png            # 128x128 图标
├── SafariDarkMode-Extension.zip   # 分发包（编译后的扩展）
├── distribution-guide-分发说明.md  # 给接收者的安装说明
└── project-guide-项目说明.md      # 详细项目文档
```

### 文件说明

**必需文件（运行扩展必须）：**
- `manifest.json` - 扩展配置文件，定义扩展名称、权限、脚本加载等
- `src/content.ts` - 内容脚本，注入到网页中实现暗黑模式
- `src/themes.ts` - 主题定义，生成暗黑模式 CSS 规则
- `src/types.d.ts` - TypeScript 类型定义
- `popup/popup.html` - 弹出面板界面
- `popup/popup.ts` - 弹出面板逻辑
- `css/darkmode.css` - 占位样式表（manifest 引用，实际规则由 content.ts 动态注入）
- `icons/icon16.png/icon48.png/icon128.png` - 扩展图标

**开发文件（开发编译必需）：**
- `tsconfig.json` - TypeScript 编译配置
- `package.json` - 依赖配置和脚本命令
- `.gitignore` - Git 忽略规则（忽略编译产物）

**编译产物（自动生成，不应提交）：**
- `src/content.js` - content.ts 编译后的文件
- `src/themes.js` - themes.ts 编译后的文件
- `popup/popup.js` - popup.ts 编译后的文件
- `*.js.map` - Source Map 文件

**分发文件：**
- `SafariDarkMode-Extension.zip` - 分发包（运行 `npm run zip` 生成）

## 快速开始

### 开发环境

```bash
cd extension-source-扩展源代码
npm install
```

### 构建

```bash
npm run build     # 编译 TypeScript -> JavaScript
npm run watch     # 监听模式
npm run clean     # 清理编译产物
```

### 打包分发

```bash
npm run zip       # 构建并生成分发包
```

## 安装到 Safari

### 开发者模式安装

1. 打开 Safari 浏览器
2. 菜单栏选择：Safari > 设置 > 扩展
3. 勾选"在菜单栏显示"复选框
4. 勾选"开发人员模式"复选框
5. 点击"加载未解包的扩展项"按钮
6. **选择 `extension-source-扩展源代码` 文件夹**（注意：必须先运行 `npm run build`）
7. 在扩展列表中找到"全局暗黑模式"并勾选启用

### 使用扩展

1. 点击 Safari 工具栏的扩展图标（拼图形状）
2. 找到"全局暗黑模式"并点击
3. 在弹出的面板中切换开关即可启用/禁用暗黑模式
4. 可以调节亮度、对比度，选择主题，或添加当前站点到白名单

## 分发给他人

1. 发送 `SafariDarkMode-Extension.zip` 给对方
2. 同时发送 `distribution-guide-分发说明.md`
3. 对方按照说明解压并安装即可

## 技术栈

- **Manifest V2**: Safari 兼容的扩展格式
- **TypeScript**: 源码语言
- **JavaScript**: 编译后运行
- **CSS**: 暗黑模式样式
- **Chrome Storage API**: 保存用户设置

## 技术说明

- 使用 `<html class="dm-on">` 作为总开关，所有暗黑规则以类选择器作用域
- 亮度/对比度通过 `filter` 作用于 `<html>`，对 `img/video/canvas/picture` 反向施加 `filter` 以抵消
- 针对地图站点检测 host / path，注入 `dm-map-site` 类后对瓦片渲染面 `invert + hue-rotate`
- `MutationObserver` 监听 `<head>`，被 SPA 清空样式时自动重新注入

## 系统要求

- macOS 11.0 或更高版本
- Safari 14.0 或更高版本

## 许可证

MIT License - 可自由使用和修改

## 开发路线图

### 阶段一：网站适配（目标 100 个热门网站）

#### 1. 网站分类和优先级
**高优先级（Top 20）：**
- 社交媒体：Twitter, Facebook, Instagram, LinkedIn, Reddit, TikTok
- 搜索引擎：Google, Bing, DuckDuckGo
- 新闻门户：BBC, CNN, NYTimes, 新浪, 腾讯新闻
- 技术平台：GitHub, Stack Overflow, Medium, Dev.to

**中优先级（Top 50）：**
- 电商：Amazon, eBay, 淘宝, 京东, 拼多多
- 视频平台：YouTube, Bilibili, Netflix
- 技术文档：MDN, W3C, Vue, React, Angular 官方文档
- 其他：Wikipedia, Quora, Pinterest

**低优先级（Top 100）：**
- 其他热门网站和垂直领域平台

#### 2. 适配方案
- **通用规则**：基于 CSS filter 的全局暗黑模式
- **网站特定规则**：为每个网站编写自定义 CSS 规则
- **智能检测**：自动识别网站类型并应用相应规则
- **地图适配**：保留已有的地图站点专用适配

#### 3. 实施步骤
1. 创建网站适配配置文件 `src/site-rules.ts`
2. 为每个网站定义域名匹配规则和 CSS 覆盖样式
3. 实现网站检测逻辑（基于 URL pattern）
4. 添加用户自定义样式编辑器
5. 建立社区贡献机制，允许用户提交适配规则

### 阶段二：自动化测试框架

#### 1. Playwright 测试框架
**测试类型：**
- **功能测试**：验证暗黑模式开关、主题切换、亮度对比度调节
- **网站适配测试**：验证每个适配网站的暗黑效果
- **视觉回归测试**：截图对比，确保样式一致性
- **性能测试**：检测扩展对页面加载性能的影响

**测试结构：**
```
tests/
├── functional/              # 功能测试
│   ├── toggle.test.ts       # 开关测试
│   ├── themes.test.ts       # 主题切换测试
│   └── settings.test.ts     # 设置持久化测试
├── site-adaptation/         # 网站适配测试
│   ├── social-media.test.ts # 社交媒体测试
│   ├── news.test.ts         # 新闻网站测试
│   └── e-commerce.test.ts   # 电商网站测试
├── visual/                  # 视觉回归测试
│   ├── screenshots/         # 基准截图
│   └── comparison.test.ts   # 截图对比测试
└── performance/             # 性能测试
    └── load-time.test.ts    # 加载时间测试
```

#### 2. CI/CD 自动化流程
**GitHub Actions 配置：**
```yaml
# .github/workflows/test.yml
name: 测试
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run test
      - run: npm run test:visual
```

**测试触发条件：**
- 每次 push 到 main 分支
- 每次 Pull Request
- 定期执行（每天凌晨）

#### 3. 视觉回归测试
- 使用 Playwright 的截图功能
- 对比暗黑模式前后的截图
- 检测颜色反转、对比度、可读性
- 自动标记视觉差异

#### 4. 测试数据管理
- 使用 GitHub Issues 跟踪适配问题
- 建立网站适配状态看板
- 自动生成测试报告
- 定期发布适配进度报告

### 阶段三：用户反馈和社区贡献

#### 1. 用户反馈收集
- 在扩展中添加"反馈适配问题"按钮
- 收集用户报告的网站适配问题
- 自动提交到 GitHub Issues

#### 2. 社区贡献机制
- 创建贡献指南 `CONTRIBUTING.md`
- 提供网站适配模板
- 允许用户提交 PR 添加新网站适配
- 审核和合并社区贡献

#### 3. 配置管理系统
- 开发在线配置管理工具
- 允许用户自定义网站适配规则
- 支持导入/导出配置
- 云端同步用户配置

### 技术债务和优化

- [ ] 优化 CSS 选择器性能
- [ ] 减少内存占用
- [ ] 支持 Manifest V3（未来迁移）
- [ ] 添加多语言支持
- [ ] 优化移动端适配
