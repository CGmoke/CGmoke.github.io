# 沧歌的博客

**一个极简风格的中文个人博客,基于 [Astro](https://astro.build/) 构建,部署在 GitHub Pages。**

在线地址:https://CGmoke.github.io/

---

## 技术栈

- **Astro(4)**:新一代静态站点框架
- **TypeScript**:带类型的 JavaScript
- **Tailwind CSS**:实用优先的 CSS 框架
- **Vue3**:局部使用 Vue 组件(如贡献日历)

## 本地开发

```bash
# 安装依赖
$ npm install

# 本地开发(默认 http://localhost:4321)
$ npm run dev

# 生产构建(产物输出到 dist/)
$ npm run build

# 本地预览构建产物
$ npm run preview
```

## 如何发布一篇文章

博客按目录区分三个分类,将 `.md` 文件放入对应目录即可(文件名即访问路径):

| 分类 | 目录 | 归档页名称 |
| --- | --- | --- |
| 编程 | `src/pages/coding/` | CODING / 「 编程 」 |
| 生活 | `src/pages/blog/` | ESSAYS / 「 生活 」 |
| 转载 | `src/pages/reship/` | RESHIP / 「 转载 」 |

文章模板(以 `src/pages/coding/hello.md` 为例):

```markdown
---
title: 我的第一篇文章
layout: '@/layouts/Post'
date: 2025-01-01
tags: blog
pin: false
language: 中文
categories:
  - 编程
label:
  - 原创
description:
  - 一句话摘要,会展示在文章列表中
image:
  - /ogImage.jpg
---

正文使用 Markdown 书写,支持代码高亮、标题锚点与目录(需二级及以上标题)。
```

> `label` 填「转载」时,文章卡片会以转载样式展示(建议同时在文首注明原文出处)。

## 部署到 GitHub Pages(自动)

仓库已内置 `.github/workflows/deploy.yml`,每次 `push` 到 `main` 分支都会自动构建并部署。

只需在仓库完成以下一次性设置:

1. 仓库 **Settings → Pages**,在 **Source(来源)** 中选择 **GitHub Actions** 并保存;
2. 将推送的代码合并到 `main`,等待 Actions 运行完成(可在仓库 **Actions** 页查看);
3. 完成后访问 https://CGmoke.github.io/ 即可看到博客。

> 仓库主页的 **Website** 链接可在 Settings 中自行改为 https://CGmoke.github.io/。

## 个性化配置

- **站点信息/导航/友链**:修改 `src/config.ts`(标题、署名、起始年份、签名、导航等);
- **头像/关于我**:侧栏头像在 `src/layouts/Home.astro` 的 `avatar` 变量中,`关于我` 页在 `src/pages/aboutme.astro`;
- **部署域名**:修改 `astro.config.mjs` 中的 `site` 字段;
- **首页贡献日历(可选)**:在部署环境变量中配置 `PUBLIC_GITHUB_TOKEN`(需 `read:user` 权限)后,首页日历会展示你的 GitHub 贡献;不配置也能正常显示文章动态。
- **封面图**:文章 `image` 指向网络图片或 `public/` 下的本地文件;站点默认的分享图是 `public/ogImage.jpg`(当前为 GitHub 头像)。

## 目录结构速览

```
astro.config.mjs        # Astro 配置(站点地址等)
src/
├─ config.ts            # 站点全局配置
├─ pages/               # 页面 + 文章(md)
├─ layouts/             # 页面布局
├─ components/          # UI 组件(含 vue/)
├─ server/getters/      # 文章与 GitHub 数据读取
└─ style/               # 全局样式
public/                 # 静态资源(favicon、字体、分享图)
.github/workflows/      # GitHub Actions 部署配置
```

## 致谢

本站基于 [Jed Xu](https://github.com/JedediahXu) 的开源博客模板 [Jed-blog](https://github.com/JedediahXu/Jed-blog)(MIT License)改造而来,感谢原作者的优秀设计。

## License

[MIT](LICENSE)
