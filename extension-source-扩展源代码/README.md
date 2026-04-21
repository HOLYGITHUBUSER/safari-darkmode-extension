# Safari 全局暗黑模式扩展

为所有网页应用暗黑模式的浏览器扩展（Safari / Chrome / Edge 通用 MV2）。源码使用 **TypeScript**。

## 功能

- 全局暗黑模式，支持 4 套主题（Dark / Sepia / Midnight / Forest）
- 亮度、对比度独立调节
- 当前站点白名单（一键禁用某站）
- 地图站点（Google Maps、高德、百度、Leaflet、Mapbox、OpenLayers 等）专用适配
- 设置自动保存，跨标签页实时同步

## 开发

### 环境准备

```bash
npm install
```

### 构建

```bash
npm run build     # 编译 TS -> JS
npm run watch     # 监听模式
npm run clean     # 清理编译产物
```

编译输出与源码同目录：

- `src/themes.ts`  → `src/themes.js`
- `src/content.ts` → `src/content.js`
- `popup/popup.ts` → `popup/popup.js`

`manifest.json` 引用的是编译后的 `.js`，所以加载扩展前必须先 `npm run build`。

### 打包分发

```bash
npm run zip
```

会先构建再在上层目录生成 `SafariDarkMode-Extension.zip`（已排除 `node_modules`、`.ts`、`tsconfig.json`）。

## 安装到 Safari（开发者模式）

1. Safari → 设置 → 高级 → 勾选"在菜单栏中显示开发菜单"
2. 开发菜单 → 允许未签名扩展
3. 先运行 `npm run build`
4. 使用 Xcode 的 "Safari Web Extension Converter" 将本目录转换为 App，或通过 `safari-web-extension-converter` 命令行工具：
   ```bash
   xcrun safari-web-extension-converter ./
   ```

## 文件结构

```
extension-source-扩展源代码/
├── manifest.json         # 扩展清单（MV2）
├── tsconfig.json         # TypeScript 配置
├── package.json
├── src/
│   ├── types.d.ts        # 全局类型声明
│   ├── themes.ts         # 主题定义 + CSS 生成
│   └── content.ts        # 内容脚本（注入到网页）
├── popup/
│   ├── popup.html        # 弹出面板
│   └── popup.ts          # 弹出面板逻辑
├── css/
│   └── darkmode.css      # 占位样式（实际规则由 content 脚本注入）
└── icons/                # 扩展图标
```

## 技术说明

- 使用 `<html class="dm-on">` 作为总开关，所有暗黑规则以类选择器作用域，避免页面侧切换时的污染
- 亮度/对比度通过 `filter` 作用于 `<html>`，对 `img/video/canvas/picture` 反向施加 `filter` 以抵消
- 针对地图站点检测 host / path，注入 `dm-map-site` 类后对瓦片渲染面 `invert + hue-rotate`
- `MutationObserver` 监听 `<head>`，被 SPA 清空样式时自动重新注入

## 许可证

MIT License
