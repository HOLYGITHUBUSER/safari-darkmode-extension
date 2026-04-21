/**
 * 全局环境类型声明
 *
 * content script / popup 都作为独立脚本（非 ES Module）加载，
 * themes.ts 通过挂载到 window 上与 content.ts 共享数据。
 */

type ThemeKey = 'dark' | 'sepia' | 'midnight' | 'forest';

interface ThemePalette {
  bg: string;
  bg2: string;
  bg3: string;
  text: string;
  muted: string;
  border: string;
  link: string;
  linkHov: string;
  input: string;
  scrollBg: string;
  scrollTh: string;
}

interface DmSettings {
  enabled: boolean;
  theme: ThemeKey;
  brightness: number;
  contrast: number;
  whitelist: string[];
}

interface DmApplyMessage {
  type: 'DM_APPLY';
  settings: DmSettings;
}

interface DmRemoveMessage {
  type: 'DM_REMOVE';
}

type DmMessage = DmApplyMessage | DmRemoveMessage;

interface Window {
  __dmInit?: boolean;
  DM_THEMES: Record<ThemeKey, ThemePalette>;
  DM_buildVars: (theme: ThemeKey, brightness: number, contrast: number) => string;
  DM_buildFilterCss: (brightness: number, contrast: number) => string;
  DM_DARK_CSS: string;
}
