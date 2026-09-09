export type RoadmapStatus = 'doing' | 'todo' | 'done'

export interface RoadmapItem {
  title: string
  description: string
  status: RoadmapStatus
  /** 进度百分比 0-100，仅进行中的事项展示 */
  progress?: number
  /** 时间标记，如 2026 Q3 */
  date?: string
  tags?: string[]
  link?: string
}

export default {
  title: `沧歌的博客`,
  name: `沧歌`,
  since: '2025',
  signature: '行而不辍，未来可期',
  friend: '也许我们可以交个朋友 👇',
  roadmap: [
    {
      title: 'ROS2 Nav2 导航实战系列',
      description: '系统整理 Nav2 导航栈教程，覆盖成本地图、行为树、路径规划与避障实战。',
      status: 'doing',
      progress: 60,
      date: '2026 Q3',
      tags: ['ROS2', 'Nav2', '机器人'],
    },
    {
      title: '博客体验持续优化',
      description: '重构首页布局、优化移动端体验，规划评论系统与文章统计增强。',
      status: 'doing',
      progress: 45,
      date: '2026 Q3',
      tags: ['Astro', 'TailwindCSS'],
    },
    {
      title: 'MoveIt2 机械臂教程系列',
      description: '从运动学基础到 MoveIt2 实战规划，输出机械臂入门与进阶内容。',
      status: 'todo',
      date: '2026 Q4',
      tags: ['ROS2', 'MoveIt2'],
    },
    {
      title: 'Rust 学习计划',
      description: '系统学习 Rust 所有权与异步编程，尝试用 Rust 重写常用工具脚本。',
      status: 'todo',
      date: '2026 Q4',
      tags: ['Rust'],
    },
    {
      title: 'Gazebo 仿真专题',
      description: '整理 Gazebo 仿真环境搭建与传感器仿真的实践经验。',
      status: 'todo',
      date: '2027 Q1',
      tags: ['Gazebo', '仿真'],
    },
    {
      title: '博客上线 & 主题搭建',
      description: '基于 Astro + Vue3 完成个人博客搭建，支持 RSS、全文搜索与暗色主题。',
      status: 'done',
      date: '2025',
      tags: ['Astro', 'Vue3'],
    },
    {
      title: 'ROS2 入门系列文章',
      description: '完成 ROS2 核心概念与通信机制系列的撰写与发布。',
      status: 'done',
      date: '2025',
      tags: ['ROS2'],
    },
  ] as RoadmapItem[],
  navs: [
    {
      title: '主页',
      url: '/',
      icon: '🏠'
    },
    {
      title: '文章归档',
      url: '/article',
      icon: '📚'
    },
    {
      title: '订阅中心',
      url: '/subscribe',
      icon: '📡'
    },
    {
      title: '关于我',
      url: '/aboutme',
      icon: '👤'
    }
  ],
  linkedList: [
    { label: 'GitHub', link: 'https://github.com/CGmoke' },
    { label: 'RSS 订阅', link: '/rss.xml' },
  ] as { label: string; link: string }[],
}
