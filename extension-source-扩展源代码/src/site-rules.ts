/**
 * site-rules.ts - 网站适配规则配置
 * 为每个网站定义自定义 CSS 规则，优化暗黑模式效果
 */

export interface SiteRule {
  name: string;
  domains: string[];
  css?: string;
  priority: number;
  notes?: string;
}

export const siteRules: SiteRule[] = [
  {
    name: 'B站',
    domains: ['bilibili.com'],
    priority: 1,
    notes: '用户最高频访问（391次）',
    css: `
      .dm-on .bili-header,
      .dm-on .bili-footer,
      .dm-on .bili-video-card {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .bili-video-card__info--tit,
      .dm-on .video-title,
      .dm-on .title {
        color: var(--dm-text) !important;
      }
      .dm-on .bili-dyn-list__item {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .bili-dyn-content {
        background-color: var(--dm-bg2) !important;
      }
    `
  },
  {
    name: '百度地图',
    domains: ['map.baidu.com', 'baidu.com'],
    priority: 2,
    notes: '用户高频访问（239次），地图站点特殊处理',
    css: `
      .dm-on #map-container,
      .dm-on .map-wrapper {
        filter: none !important;
      }
      .dm-on .BMap_bubble_pop,
      .dm-on .BMap_pop {
        background-color: var(--dm-bg2) !important;
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: 'GitHub',
    domains: ['github.com'],
    priority: 3,
    notes: '用户高频访问（119次）',
    css: `
      .dm-on .header,
      .dm-on .application-main,
      .dm-on .Box {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .markdown-body,
      .dm-on p {
        color: var(--dm-text) !important;
      }
      .dm-on a {
        color: var(--dm-link) !important;
      }
      .dm-on .btn-primary {
        background-color: var(--dm-link) !important;
      }
    `
  },
  {
    name: 'Google',
    domains: ['google.com', 'google.com.hk'],
    priority: 4,
    notes: '用户高频访问（22次）',
    css: `
      .dm-on .sfbg,
      .dm-on .A8SBwf {
        background-color: var(--dm-bg) !important;
      }
      .dm-on .a8p37c,
      .dm-on .L3UUxb {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .yuRUbf,
      .dm-on .VwiC3b {
        color: var(--dm-text) !important;
      }
      .dm-on .LC20lb {
        color: var(--dm-link) !important;
      }
    `
  },
  {
    name: 'Discord',
    domains: ['discord.com'],
    priority: 5,
    notes: '用户高频访问（15次）',
    css: `
      .dm-on .app-2CXKsg,
      .dm-on .sidebar-1tnWFu,
      .dm-on .chat-2ZfjoI {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .markup-eYLPri {
        color: var(--dm-text) !important;
      }
      .dm-on .username-h_Y3Us {
        color: var(--dm-link) !important;
      }
    `
  },
  {
    name: 'Gmail',
    domains: ['mail.google.com'],
    priority: 6,
    notes: '用户高频访问（12次）',
    css: `
      .dm-on .nH,
      .dm-on .aoO {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .zA,
      .dm-on .yW {
        color: var(--dm-text) !important;
      }
      .dm-on .y6 span {
        color: var(--dm-muted) !important;
      }
    `
  },
  {
    name: 'Windsurf',
    domains: ['windsurf.com'],
    priority: 7,
    notes: '用户访问（8次）',
    css: `
      .dm-on header,
      .dm-on main,
      .dm-on .bg-white {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on h1,
      .dm-on h2,
      .dm-on p {
        color: var(--dm-text) !important;
      }
      .dm-on a {
        color: var(--dm-link) !important;
      }
    `
  },
  {
    name: '百度',
    domains: ['baidu.com'],
    priority: 8,
    css: `
      .dm-on #s_tab,
      .dm-on #content_left {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .t {
        color: var(--dm-link) !important;
      }
    `
  },
  {
    name: '知乎',
    domains: ['zhihu.com'],
    priority: 9,
    css: `
      .dm-on .AppHeader,
      .dm-on .QuestionHeader-main {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .QuestionHeader-title {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '京东',
    domains: ['jd.com'],
    priority: 10,
    css: `
      .dm-on .fs-mod-head,
      .dm-on .fs-mod-main {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .p-name a {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '知乎',
    domains: ['zhihu.com'],
    priority: 1,
    css: `
      .dm-on .AppHeader,
      .dm-on .QuestionHeader-main {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .QuestionHeader-title {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '淘宝',
    domains: ['taobao.com'],
    priority: 11,
    css: `
      .dm-on .site-nav,
      .dm-on .J_ItemList {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .title {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '微博',
    domains: ['weibo.com'],
    priority: 12,
    css: `
      .dm-on .WB_frame,
      .dm-on .WB_cardwrap {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .WB_text {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '掘金',
    domains: ['juejin.cn'],
    priority: 13,
    css: `
      .dm-on .header-container,
      .dm-on .article-area {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .article-title {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: 'CSDN',
    domains: ['csdn.net'],
    priority: 14,
    css: `
      .dm-on .toolbar-container,
      .dm-on .blog-content-box {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .title-article {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '豆瓣',
    domains: ['douban.com'],
    priority: 15,
    css: `
      .dm-on .nav,
      .dm-on .article {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .title {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '网易云音乐',
    domains: ['163.com'],
    priority: 16,
    css: `
      .dm-on .g-topbar,
      .dm-on .g-mn {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .f-ff2 {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '小红书',
    domains: ['xiaohongshu.com'],
    priority: 17,
    css: `
      .dm-on .nav,
      .dm-on .note-detail {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .title {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '拼多多',
    domains: ['pinduoduo.com'],
    priority: 18,
    css: `
      .dm-on .header,
      .dm-on .goods-list {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .goods-name {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '优酷',
    domains: ['youku.com'],
    priority: 19,
    css: `
      .dm-on .header,
      .dm-on .video-info {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .title {
        color: var(--dm-text) !important;
      }
    `
  },
  {
    name: '爱奇艺',
    domains: ['iqiyi.com'],
    priority: 20,
    css: `
      .dm-on .header,
      .dm-on .qy-player-wrap {
        background-color: var(--dm-bg2) !important;
      }
      .dm-on .title {
        color: var(--dm-text) !important;
      }
    `
  }
];

/**
 * 根据当前域名获取适配规则
 */
export function getSiteRule(hostname: string): SiteRule | null {
  const host = hostname.toLowerCase();
  for (const rule of siteRules) {
    for (const domain of rule.domains) {
      if (host.includes(domain)) {
        return rule;
      }
    }
  }
  return null;
}

/**
 * 注入网站特定的 CSS 规则
 */
export function injectSiteRules(hostname: string): void {
  const rule = getSiteRule(hostname);
  if (rule && rule.css) {
    const style = document.createElement('style');
    style.id = 'dm-site-rules';
    style.textContent = rule.css;
    document.head.appendChild(style);
  }
}
