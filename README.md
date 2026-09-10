# 沧歌的博客

**一个极简风格的中文个人博客，基于 [Astro](https://astro.build/) 构建，部署在 GitHub Pages。**

在线地址：https://CGmoke.github.io/

---

## 技术栈

- **Astro(4)**：新一代静态站点框架
- **TypeScript**：带类型的 JavaScript
- **Tailwind CSS**：实用优先的 CSS 框架
- **Vue3**：局部使用 Vue 组件（首页 GitHub 风格活动日历）
- **PageFind**：构建时生成的全站全文搜索索引
- **@astrojs/rss**：生成 RSS 订阅源（`/rss.xml`）
- **Sass**：组件级样式预处理器

## 本地开发

```bash
# 安装依赖
$ npm install

# 本地开发（默认 http://localhost:4321）
$ npm run dev

# 生产构建（astro build + 生成 PageFind 索引，产物输出到 dist/）
$ npm run build

# 本地预览构建产物
$ npm run preview
```

> `npm run start` 等同于 `npm run preview`。

## 页面与功能一览

| 路由 | 说明 |
| --- | --- |
| `/` | 首页：活动日历（置顶）→ 近期动态统计 → 近期规划 Roadmap → 近期文章 |
| `/article` | 文章归档：统一列出三大分类，支持搜索、按年份/标签/分类筛选 |
| `/subscribe` | 订阅中心：RSS 订阅说明与平台链接 |
| `/aboutme` | 关于我：GitHub Profile 风格个人主页 |
| `/rss.xml` | RSS 订阅源 |

## 如何发布一篇文章

博客按目录区分三个分类，将 `.md` 文件放入对应目录即可（文件名即访问路径）：

| 分类 | 目录 |
| --- | --- |
| 编程 | `src/pages/coding/` |
| 生活 | `src/pages/blog/` |
| 转载 | `src/pages/reship/` |

文章模板（以 `src/pages/coding/hello.md` 为例）：

```markdown
---
title: 我的第一篇文章
layout: '@/layouts/Post'
date: 2025-01-01
tags: [博客, 教程]
pin: false
language: 中文
categories:
  - 编程
label:
  - 原创
description:
  - 一句话摘要，会展示在文章列表中
image:
  - /ogImage.jpg
---

正文使用 Markdown 书写，支持代码高亮、标题锚点与目录（需二级及以上标题）。
```

### Frontmatter 字段说明

- `tags`：标签，数组形式，会汇总到归档页的标签云
- `pin`：置顶（`true` / `false`）
- `categories` / `label`：填「转载」时，文章卡片会以转载样式展示（建议同时在文首注明原文出处）
- `description`：摘要，展示在文章列表与卡片
- `image`：封面图，指向网络图片或 `public/` 下的本地文件

## 部署到 GitHub Pages（自动）

仓库已内置 `.github/workflows/deploy.yml`（Node 20），每次 `push` 到 `main` 分支都会自动构建并部署。

只需在仓库完成以下一次性设置：

1. 仓库 **Settings → Pages**，在 **Source（来源）** 中选择 **GitHub Actions** 并保存；
2. 将推送的代码合并到 `main`，等待 Actions 运行完成（可在仓库 **Actions** 页查看）；
3. 完成后访问 https://CGmoke.github.io/ 即可看到博客。

> 仓库主页的 **Website** 链接可在 Settings 中自行改为 https://CGmoke.github.io/。

## 个性化配置

大部分站点配置集中在 `src/config.ts`：

- **站点信息**：`title`（标题）、`name`（署名）、`since`（起始年份）、`signature`（签名）
- **导航**：`navs`（主页 / 文章归档 / 订阅中心 / 关于我）
- **友链**：`linkedList`
- **首页日历展板链接**：`platforms`（GitHub / LeetCode / CSDN 等平台主页，配合内联图标展示）
- **首页近期规划**：`roadmap`（进行中 / 规划中 / 已完成，支持进度 `progress`、时间 `date`、标签 `tags`、链接 `link`）

其它位置：

- **头像**：`src/config.ts` 的 `avatar` 字段（用于日历展板）；侧栏头像在 `src/layouts/Home.astro` 顶部的 `avatar` 变量
- **关于我** 页内容：`src/pages/aboutme.astro`（简介、项目卡片、近期动态、联系方式）
- **订阅中心**：`src/pages/subscribe.astro`
- **部署域名**：修改 `astro.config.mjs` 中的 `site` 字段
- **首页贡献日历（可选）**：在部署环境变量中配置 `PUBLIC_GITHUB_TOKEN`（需 `read:user` 权限）后，首页日历会展示你的 GitHub 贡献；不配置也能正常显示文章动态
- **站点默认分享图**：`public/ogImage.jpg`（当前为 GitHub 头像）

## 目录结构速览

```
astro.config.mjs        # Astro 配置（站点地址、Tailwind、Vue、代码高亮等）
src/
├─ config.ts            # 站点全局配置（站点信息 / 导航 / Roadmap / 平台链接）
├─ pages/               # 页面 + 归档页 + 文章(md) + rss.xml.js
├─ layouts/             # 页面布局（BaseLayout / Home / Post）
├─ components/          # UI 组件
│  ├─ vue/ActivityCalendar.vue  # GitHub 风格活动日历（年/月切换、悬停提示、平台展板）
│  ├─ Roadmap.astro             # 首页「近期规划」卡片
│  ├─ TOC.astro                 # 文章目录
│  ├─ PageFind.astro            # 全文搜索（构建时生成索引）
│  └─ ...                       # 文章列表、主题切换、星空背景等
├─ server/getters/      # 文章与 GitHub 数据读取
├─ utils/               # 工具（日期格式化、阅读时长 remark 插件）
└─ style/               # 全局样式
public/                 # 静态资源（favicon、字体、分享图）
.github/workflows/      # GitHub Actions 部署配置
```

## 致谢

本站基于 [Jed Xu](https://github.com/JedediahXu) 的开源博客模板 [Jed-blog](https://github.com/JedediahXu/Jed-blog)（MIT License）改造而来，感谢原作者的优秀设计。

## License

[MIT](LICENSE)