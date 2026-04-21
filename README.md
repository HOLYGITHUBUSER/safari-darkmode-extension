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
