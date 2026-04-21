# Safari 全局暗黑模式插件

为所有网页应用暗黑模式的 Safari 扩展。

## 功能

- ✅ 全局暗黑模式，对所有网页生效
- ✅ 一键开关，方便切换
- ✅ 使用 CSS filter 技术，兼容性好
- ✅ 自动保存设置

## 安装方法

### 开发者模式安装（无需 Apple 开发者账号）

1. **打开 Safari 偏好设置**
   - Safari > 偏好设置 > 扩展

2. **启用开发者模式**
   - 在左下角勾选"在菜单栏显示"
   - 勾选"开发人员模式"

3. **加载扩展**
   - 点击"开发人员模式"旁边的复选框
   - 点击"加载未解包的扩展项"
   - 选择 `simple-safari-darkmode` 文件夹

4. **启用扩展**
   - 在扩展列表中找到"全局暗黑模式"
   - 勾选启用

### 使用方法

1. 点击 Safari 工具栏中的扩展图标
2. 在弹出的面板中切换开关
3. 暗黑模式会立即应用到当前标签页
4. 设置会自动保存，下次访问时生效

## 技术实现

- **Manifest V2**: Safari 兼容的扩展格式
- **Content Scripts**: 注入到所有网页
- **CSS Filter**: 使用 `invert()` 和 `hue-rotate()` 实现暗黑效果
- **Storage API**: 保存用户设置

## 文件结构

```
simple-safari-darkmode/
├── manifest.json       # 扩展配置文件
├── content.js          # 内容脚本（注入到网页）
├── darkmode.css        # 暗黑模式样式
├── popup.html          # 弹出界面
├── popup.js            # 弹出界面逻辑
├── icon16.png          # 16x16 图标
├── icon48.png          # 48x48 图标
└── icon128.png         # 128x128 图标
```

## 注意事项

- 此扩展使用 CSS filter 技术，可能会影响某些网站的颜色显示
- 如需排除特定网站，可以在 `manifest.json` 中修改 `matches` 规则
- 图片、视频等媒体元素会自动反转以保持正常显示

## 许可证

MIT License
