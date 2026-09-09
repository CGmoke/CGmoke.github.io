export default {
  title: `沧歌的博客`,
  name: `沧歌`,
  since: '2025',
  signature: '行而不辍，未来可期',
  friend: '也许我们可以交个朋友 👇',
  navs: [
    {
      title: '主页',
      url: '/'
    },
    {
      title: '文章归档',
      url: '/article'
    },
    {
      title: '订阅中心',
      url: '/subscribe'
    },
    {
      title: '关于我',
      url: '/aboutme'
    }
  ],
  linkedList: [
    { label: 'GitHub', link: 'https://github.com/CGmoke' },
    { label: 'RSS 订阅', link: '/rss.xml' },
  ] as { label: string; link: string }[],
}
