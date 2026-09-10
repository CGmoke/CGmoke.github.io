<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import config from '../../config'
import { dateToYMD } from '../../utils/moment'

interface GitHubDay {
  date: string
  count: number
}

const props = defineProps<{
  /** getArticleData() 的返回结构（构建时传入） */
  article: any
  /** 构建时拉取的 GitHub 贡献数据（仅包含有贡献的日期） */
  githubDays?: GitHubDay[]
}>()

/* ---------------- 品牌图标（内联 SVG，随文字颜色 / 悬停品牌色） ---------------- */
const BRAND_ICONS: Record<string, { viewBox: string; color: string; path: string }> = {
  GitHub: {
    viewBox: '0 0 16 16',
    color: '#24292f',
    path: 'M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8Z',
  },
  LeetCode: {
    viewBox: '0 0 24 24',
    color: '#ffa116',
    path: 'M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z',
  },
  CSDN: {
    viewBox: '0 0 24 24',
    color: '#fc5531',
    path: 'M4.693 13.638c-.497.568-1.363.63-1.712.63-.648 0-1.144-.164-1.474-.488-.313-.307-.478-.76-.489-1.346-.025-1.358.744-2.762 2.074-2.762.635 0 1.124.455 1.311.644a.337.337 0 0 0 .282.099.38.38 0 0 0 .241-.159c.068-.087.135-.237.138-.401s-.057-.344-.243-.49a2.642 2.642 0 0 0-1.668-.591c-.819 0-1.627.376-2.218 1.033-.621.691-.953 1.63-.935 2.646.015.815.282 1.5.773 1.982.528.518 1.3.791 2.235.791 1.097 0 1.776-.325 2.154-.597a.584.584 0 0 0 .24-.456.702.702 0 0 0-.208-.497c.23-.248-.448-.101-.503-.037ZM9.663 11.488a7.471 7.471 0 0 0-.698-.248c-.157-.048-.309-.091-.45-.131-.922-.26-1.027-.5-1.017-.68.022-.363.515-.853 1.352-.792.607.045 1.015.509 1.205.781.149.214.371.135.434.095a.602.602 0 0 0 .309-.514.626.626 0 0 0-.209-.488 2.654 2.654 0 0 0-3.347-.273c-.456.323-.744.772-.77 1.202-.064 1.061 1.015 1.366 1.803 1.588.214.061.429.127.667.202 1.14.357 1.173.717 1.092 1.267-.082.556-.696.834-1.685.761-1.029-.076-1.464-.61-1.612-.901-.05-.098-.205-.248-.413-.156-.514.229-.473.731-.26.993.339.416 1.15 1.035 2.667 1.035 1.734 0 2.255-.875 2.378-1.64.092-.572-.022-1.028-.348-1.396-.236-.267-.592-.495-1.101-.706ZM16.44 9.323c-.598-.431-1.393-.61-2.36-.532-.712.058-1.274.243-1.335.263l-.006.002a.437.437 0 0 0-.297.379l-.47 5.201a.337.337 0 0 0 .247.35l.072.02.066.018.086.021a7.914 7.914 0 0 0 1.64.183c.972 0 1.765-.23 2.36-.684.764-.583 1.141-1.5 1.118-2.725-.021-1.135-.398-1.974-1.121-2.495Zm-.662 4.461c-.836.639-2.09.562-2.677.481a.128.128 0 0 1-.109-.137l.397-4.248a.113.113 0 0 1 .086-.1c.999-.241 1.777-.168 2.312.218.189.137.348.331.471.568.176.339.277.765.286 1.234.017.916-.24 1.583-.765 1.984ZM23.967 10.41a1.92 1.92 0 0 0-.432-.919c-.399-.465-1.029-.689-1.848-.689-.734 0-1.372.228-1.947.799.007-.086.019-.159.018-.223s-.017-.116-.066-.163c-.048-.045-.077-.067-.127-.077-.05-.01-.122-.008-.256-.006a.587.587 0 0 0-.589.54s-.325 3.874-.428 5.165a.308.308 0 0 0 .073.228.36.36 0 0 0 .26.131h.387a.224.224 0 0 1 .226-.205l.273-2.929.014-.147a1.902 1.902 0 0 1 .082-.412c.014-.045.03-.092.047-.14.245-.694.803-1.72 1.971-1.694.84.018 1.449.455 1.385 1.114-.101 1.034-.266 3.1-.358 4.14-.019.209.182.273.252.273h.304a.442.442 0 0 0 .444-.404s.185-2.127.294-3.352l.048-.532a1.959 1.959 0 0 0-.026-.5Z',
  },
}
const FALLBACK_ICON = {
  viewBox: '0 0 24 24',
  color: '#656d76',
  path: 'M3.9 12a3.1 3.1 0 0 1 3.1-3.1h4V7H7a5 5 0 0 0-5 5 5 5 0 0 0 5 5h4v-1.9H7A3.1 3.1 0 0 1 3.9 12M8 13h8v-2H8v2m9-6h-4v1.9h4a3.1 3.1 0 0 1 3.1 3.1 3.1 3.1 0 0 1-3.1 3.1h-4V17h4a5 5 0 0 0 5-5 5 5 0 0 0-5-5',
}
const iconOf = (name: string) => BRAND_ICONS[name] ?? FALLBACK_ICON
const platforms = config.platforms ?? []

/* ---------------- 数据解析（含错误处理） ---------------- */
const loadError = ref(false)
const articleMap = new Map<string, number>()
const githubMap = new Map<string, number>()

function parseData() {
  articleMap.clear()
  githubMap.clear()
  for (const week of props.article?.weeks ?? []) {
    for (const d of week?.contributionDays ?? []) {
      if (!d?.date) continue
      // 同一天可能有多篇文章，按日期聚合累加
      articleMap.set(d.date, (articleMap.get(d.date) ?? 0) + (d.contributionCount ?? 0))
    }
  }
  for (const d of props.githubDays ?? []) {
    if (!d?.date) continue
    githubMap.set(d.date, (githubMap.get(d.date) ?? 0) + (d.count ?? 0))
  }
}

try {
  parseData()
} catch (error) {
  console.error('[ActivityCalendar] 数据解析失败:', error)
  loadError.value = true
}

function retry() {
  try {
    parseData()
    loadError.value = false
  } catch (error) {
    console.error('[ActivityCalendar] 重试失败:', error)
    loadError.value = true
  }
}

/* ---------------- 视图状态 ---------------- */
const now = new Date()
const TODAY = dateToYMD(now)
const THIS_YEAR = now.getFullYear()
const THIS_MONTH = now.getMonth()

/** 骨架屏：组件（client:only）完成挂载前展示 */
const mounted = ref(false)
const viewMode = ref<'year' | 'month'>('year')
const year = ref(THIS_YEAR)
const month = ref(THIS_MONTH)

onMounted(() => {
  mounted.value = true
})

/** 可回退的最早年份：取文章 / GitHub 数据中的最早年份 */
const minYear = computed(() => {
  let min = THIS_YEAR
  articleMap.forEach((_, date) => {
    const y = Number(date.slice(0, 4))
    if (y < min) min = y
  })
  githubMap.forEach((_, date) => {
    const y = Number(date.slice(0, 4))
    if (y < min) min = y
  })
  return min
})

const canPrev = computed(() =>
  viewMode.value === 'year'
    ? year.value > minYear.value
    : year.value > minYear.value || month.value > 0
)
const canNext = computed(() =>
  viewMode.value === 'year'
    ? year.value < THIS_YEAR
    : year.value < THIS_YEAR || month.value < THIS_MONTH
)

const rangeTitle = computed(() =>
  viewMode.value === 'year' ? `${year.value} 年` : `${year.value} 年 ${month.value + 1} 月`
)
const prevLabel = computed(() => (viewMode.value === 'year' ? '上一年' : '上个月'))
const nextLabel = computed(() => (viewMode.value === 'year' ? '下一年' : '下个月'))

function goPrev() {
  if (!canPrev.value) return
  if (viewMode.value === 'year') {
    year.value--
  } else if (month.value === 0) {
    month.value = 11
    year.value--
  } else {
    month.value--
  }
}

function goNext() {
  if (!canNext.value) return
  if (viewMode.value === 'year') {
    year.value++
  } else if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
}

function setView(mode: 'year' | 'month') {
  viewMode.value = mode
}

/** 年视图中点击月份标签 → 进入该月视图 */
function gotoMonth(monthIndex: number) {
  month.value = monthIndex
  viewMode.value = 'month'
}

function backToYear() {
  viewMode.value = 'year'
}

/* ---------------- 日历网格构建 ---------------- */
interface CellDay {
  date: string
  inRange: boolean
  articles: number
  contributions: number
  total: number
  level: number
  isToday: boolean
  isFuture: boolean
}

const WEEK_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const MONTH_NAMES = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)

/** GitHub 风格 5 级活跃度色阶 */
function levelOf(total: number) {
  if (total <= 0) return 0
  if (total <= 3) return 1
  if (total <= 6) return 2
  if (total <= 9) return 3
  return 4
}

function makeDay(d: Date, inRange: boolean): CellDay {
  const date = dateToYMD(d)
  const articles = articleMap.get(date) ?? 0
  const contributions = githubMap.get(date) ?? 0
  const total = articles + contributions
  return {
    date,
    inRange,
    articles,
    contributions,
    total,
    level: levelOf(total),
    isToday: date === TODAY,
    isFuture: d.getTime() > now.getTime(),
  }
}

/** 以周日为每周起始，构建覆盖 [start, end] 的周列网格 */
function buildWeeks(start: Date, end: Date, inRangeFn: (d: Date) => boolean): CellDay[][] {
  const weeks: CellDay[][] = []
  const cursor = new Date(start)
  while (true) {
    const week: CellDay[] = []
    for (let i = 0; i < 7; i++) {
      week.push(makeDay(new Date(cursor), inRangeFn(cursor)))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (cursor > end) break
  }
  return weeks
}

/** 年视图：覆盖该年全部日期的 53 周网格（GitHub 个人主页样式） */
const yearWeeks = computed(() => {
  const start = new Date(year.value, 0, 1)
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(year.value, 11, 31)
  return buildWeeks(start, end, (d) => d.getFullYear() === year.value)
})

/** 月视图：仅覆盖当月（含首尾补齐周） */
const monthWeeks = computed(() => {
  const first = new Date(year.value, month.value, 1)
  const start = new Date(first)
  start.setDate(1 - first.getDay())
  const end = new Date(year.value, month.value + 1, 0)
  return buildWeeks(start, end, (d) => d.getFullYear() === year.value && d.getMonth() === month.value)
})

const activeWeeks = computed(() => (viewMode.value === 'year' ? yearWeeks.value : monthWeeks.value))

/** 年视图顶部的月份标签：定位到包含每月 1 号的周列 */
const monthLabels = computed(() => {
  const labels: { col: number; text: string; monthIndex: number }[] = []
  yearWeeks.value.forEach((week, col) => {
    for (const day of week) {
      if (day.inRange && day.date.endsWith('-01')) {
        const monthIndex = Number(day.date.slice(5, 7)) - 1
        labels.push({ col, text: MONTH_NAMES[monthIndex], monthIndex })
        break
      }
    }
  })
  return labels
})

/** 当前视图范围内的活动统计 */
const stats = computed(() => {
  let articles = 0
  let contributions = 0
  let activeDays = 0
  for (const week of activeWeeks.value) {
    for (const day of week) {
      if (!day.inRange || day.isFuture) continue
      articles += day.articles
      contributions += day.contributions
      if (day.total > 0) activeDays++
    }
  }
  return { articles, contributions, total: articles + contributions, activeDays }
})

const footerText = computed(
  () =>
    `${rangeTitle.value}共 ${stats.value.total} 次活动 · ${stats.value.contributions} 次提交 · ${stats.value.articles} 篇文章 · 活跃 ${stats.value.activeDays} 天`
)

/* ---------------- 悬停 / 聚焦提示 ---------------- */
interface TipState {
  x: number
  y: number
  align: 'left' | 'center' | 'right'
  day: CellDay
}

const rootRef = ref<HTMLElement | null>(null)
const tip = ref<TipState | null>(null)

function onDayEnter(event: MouseEvent | FocusEvent, day: CellDay) {
  if (!day.inRange || !rootRef.value) return
  const cell = event.currentTarget as HTMLElement
  const cr = cell.getBoundingClientRect()
  const rr = rootRef.value.getBoundingClientRect()
  const x = cr.left - rr.left + cr.width / 2
  const align = x < 90 ? 'left' : x > rr.width - 90 ? 'right' : 'center'
  tip.value = { x, y: cr.top - rr.top, align, day }
}

function onDayLeave() {
  tip.value = null
}

// 视图切换时隐藏残留提示
watch([viewMode, year, month], () => {
  tip.value = null
})

function formatDate(ymd: string) {
  const d = new Date(`${ymd}T00:00:00`)
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${WEEK_NAMES[d.getDay()]}`
}

function dayAriaLabel(day: CellDay) {
  if (!day.inRange) return undefined
  const base = formatDate(day.date)
  return day.total > 0
    ? `${base}，${day.contributions} 次提交，${day.articles} 篇文章`
    : `${base}，无活动`
}
</script>

<template>
  <div ref="rootRef" class="gh-cal" data-pagefind-ignore>
    <!-- 顶部导航展板（不随网格横向滚动） -->
    <header class="gh-cal-header">
      <div class="gh-cal-profile">
        <img
          class="gh-cal-avatar"
          :src="config.avatar"
          :alt="`${config.name} 的头像`"
          width="40"
          height="40"
          loading="lazy"
          decoding="async"
        />
        <div class="gh-cal-id">
          <p class="gh-cal-name">{{ config.name }} 的开发足迹</p>
          <p class="gh-cal-sub">{{ rangeTitle }} · 共 {{ stats.total }} 次活动</p>
        </div>
      </div>
      <nav class="gh-cal-links" aria-label="个人主页链接">
        <a
          v-for="p in platforms"
          :key="p.name"
          class="gh-cal-link"
          :href="p.url"
          target="_blank"
          rel="noopener noreferrer"
          :style="{ '--brand': iconOf(p.name).color }"
          :aria-label="`在新窗口访问 ${config.name} 的 ${p.name} 主页`"
        >
          <svg :viewBox="iconOf(p.name).viewBox" aria-hidden="true" focusable="false">
            <path :d="iconOf(p.name).path" />
          </svg>
          <span>{{ p.name }}</span>
        </a>
      </nav>
    </header>

    <!-- 控制栏：年/月切换 + 前后翻页 -->
    <div class="gh-cal-bar">
      <div class="gh-cal-switcher">
        <button
          type="button"
          class="gh-btn"
          :disabled="!canPrev"
          :aria-label="prevLabel"
          @click="goPrev"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z" /></svg>
        </button>
        <span class="gh-cal-range" aria-live="polite">{{ rangeTitle }}</span>
        <button
          type="button"
          class="gh-btn"
          :disabled="!canNext"
          :aria-label="nextLabel"
          @click="goNext"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" /></svg>
        </button>
      </div>
      <div class="gh-cal-viewtoggle" role="tablist" aria-label="日历视图切换">
        <button
          type="button"
          role="tab"
          :aria-selected="viewMode === 'year'"
          :class="{ on: viewMode === 'year' }"
          @click="setView('year')"
        >
          年
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="viewMode === 'month'"
          :class="{ on: viewMode === 'month' }"
          @click="setView('month')"
        >
          月
        </button>
      </div>
    </div>

    <!-- 日历主体 -->
    <div class="gh-cal-body">
      <!-- 错误态 -->
      <div v-if="loadError" class="gh-cal-error" role="alert">
        <span>活动数据加载失败，请重试</span>
        <button type="button" class="gh-btn gh-btn-text" @click="retry">重试</button>
      </div>

      <!-- 加载骨架 -->
      <div v-else-if="!mounted" class="gh-cal-skeleton" role="status" aria-label="日历加载中">
        <div class="sk-head"></div>
        <div class="sk-grid"></div>
      </div>

      <!-- 日历网格 -->
      <Transition v-else name="ghfade" mode="out-in">
        <div :key="`${viewMode}-${year}-${month}`" class="gh-cal-view">
          <div class="gh-scroll">
            <div class="gh-year">
              <!-- 月份标签行（仅年视图，可点击进入月视图） -->
              <div v-if="viewMode === 'year'" class="gh-months">
                <span
                  v-for="label in monthLabels"
                  :key="label.col"
                  class="gh-mlabel"
                  :style="{ gridColumnStart: label.col + 1 }"
                >
                  <button
                    type="button"
                    class="gh-mlabel-btn"
                    :aria-label="`查看 ${year} 年 ${label.monthIndex + 1} 月`"
                    @click="gotoMonth(label.monthIndex)"
                  >
                    {{ label.text }}
                  </button>
                </span>
              </div>

              <div class="gh-main">
                <!-- 星期标签列（装饰性，读屏软件跳过） -->
                <div class="gh-weekdays" aria-hidden="true">
                  <span></span><span>一</span><span></span><span>三</span><span></span><span>五</span><span></span>
                </div>

                <div class="gh-grid" role="grid" :aria-label="`${rangeTitle}活动贡献日历`">
                  <div v-for="(week, wi) in activeWeeks" :key="wi" class="gh-week" role="row">
                    <div
                      v-for="day in week"
                      :key="day.date"
                      class="gh-day"
                      role="gridcell"
                      :class="{ empty: !day.inRange, today: day.isToday, future: day.isFuture }"
                      :data-level="day.inRange ? day.level : undefined"
                      :style="{ '--wi': wi }"
                      :tabindex="day.inRange && day.total > 0 && !day.isFuture ? 0 : -1"
                      :aria-label="dayAriaLabel(day)"
                      @mouseenter="onDayEnter($event, day)"
                      @mouseleave="onDayLeave"
                      @focus="onDayEnter($event, day)"
                      @blur="onDayLeave"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部：统计 + 图例 -->
          <footer class="gh-cal-footer">
            <span class="gh-cal-total">{{ footerText }}</span>
            <div class="gh-legend" aria-hidden="true">
              <span>少</span>
              <i v-for="l in 5" :key="l" :data-level="l - 1"></i>
              <span>多</span>
            </div>
          </footer>
          <p v-if="viewMode === 'year'" class="gh-cal-hint">提示：点击月份标签可查看单月详情</p>
        </div>
      </Transition>
    </div>

    <!-- 单一浮动提示框 -->
    <div
      v-if="tip"
      class="gh-tip"
      :class="`align-${tip.align}`"
      :style="{ left: `${tip.x}px`, top: `${tip.y}px` }"
      role="tooltip"
    >
      <strong>{{ formatDate(tip.day.date) }}</strong>
      <span>
        <template v-if="tip.day.total > 0">{{ tip.day.contributions }} 次提交 · {{ tip.day.articles }} 篇文章</template>
        <template v-else>当天没有活动</template>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.gh-cal {
  /* GitHub 风格配色（浅色）+ 站点渐变强调色 */
  --l0: #ebedf0;
  --l1: #9be9a8;
  --l2: #40c463;
  --l3: #30a14e;
  --l4: #216e39;
  --ink: #1f2328;
  --muted: #656d76;
  --card: rgba(255, 255, 255, 0.6);
  --panel: rgba(255, 255, 255, 0.45);
  --line: rgba(0, 0, 0, 0.08);
  --accent: #6e63f6;
  --cell: 11px;
  --gap: 3px;
  --wk: 20px;

  position: relative;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: var(--card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--ink);
  font-size: 12px;
}

html.dark & {
  --l0: rgba(255, 255, 255, 0.09);
  --l1: #0e4429;
  --l2: #006d32;
  --l3: #26a641;
  --l4: #39d353;
  --ink: #e6edf3;
  --muted: #9198a1;
  --card: rgba(68, 68, 68, 0.6);
  --panel: rgba(0, 0, 0, 0.18);
  --line: rgba(255, 255, 255, 0.08);

  border-color: rgba(255, 255, 255, 0.08);
}

/* ---------- 顶部导航展板 ---------- */
.gh-cal-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  margin-bottom: 0.875rem;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--panel);
}

.gh-cal-profile {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
}

.gh-cal-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  flex-shrink: 0;
}

.gh-cal-id {
  min-width: 0;
}

.gh-cal-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gh-cal-sub {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--muted);
}

.gh-cal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.gh-cal-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--card);
  color: var(--ink);
  font-size: 12px;
  line-height: 1;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, color 0.2s ease;

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
    transition: fill 0.2s ease;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: var(--brand, var(--accent));
    color: var(--brand, var(--accent));
    box-shadow: 0 4px 12px rgba(110, 99, 246, 0.22);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

html.dark & .gh-cal-link:hover {
  color: var(--ink);
  border-color: var(--brand, var(--accent));

  svg {
    fill: var(--brand, var(--accent));
  }
}

/* ---------- 控制栏 ---------- */
.gh-cal-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
}

.gh-cal-switcher {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.gh-cal-range {
  min-width: 6.5em;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.gh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--panel);
  color: var(--ink);
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease, opacity 0.2s ease;

  svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
  }

  &:hover:not(:disabled) {
    background: var(--line);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
}

.gh-btn-text {
  width: auto;
  padding: 0 0.75rem;
  font-size: 12px;
}

.gh-cal-viewtoggle {
  display: inline-flex;
  padding: 2px;
  border-radius: 8px;
  border: 1px solid var(--line);
  background: var(--panel);

  button {
    padding: 0.2rem 0.8rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--muted);
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;

    &.on {
      background: linear-gradient(135deg, #60a5fa, #a78bfa);
      color: #fff;
    }

    &:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
  }
}

/* ---------- 日历主体 ---------- */
.gh-scroll {
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
}

.gh-months {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: var(--cell);
  column-gap: var(--gap);
  margin-left: calc(var(--wk) + 6px);
  margin-bottom: 4px;
}

.gh-mlabel {
  width: var(--cell);
  overflow: visible;
  white-space: nowrap;
}

.gh-mlabel-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.4;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--accent);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
    border-radius: 2px;
  }
}

.gh-main {
  display: flex;
  gap: 6px;
}

.gh-weekdays {
  display: grid;
  grid-template-rows: repeat(7, var(--cell));
  row-gap: var(--gap);
  width: var(--wk);
  flex-shrink: 0;

  span {
    font-size: 9px;
    line-height: var(--cell);
    color: var(--muted);
  }
}

.gh-grid {
  display: flex;
  gap: var(--gap);
}

.gh-week {
  display: grid;
  grid-template-rows: repeat(7, var(--cell));
  row-gap: var(--gap);
}

.gh-day {
  width: var(--cell);
  height: var(--cell);
  border-radius: 2px;
  background: var(--l0);
  animation: gh-pop 0.3s ease both;
  animation-delay: calc(var(--wi) * 6ms);

  &[data-level='1'] { background: var(--l1); }
  &[data-level='2'] { background: var(--l2); }
  &[data-level='3'] { background: var(--l3); }
  &[data-level='4'] { background: var(--l4); }

  &.empty {
    visibility: hidden;
  }

  &.future {
    opacity: 0.35;
  }

  &.today {
    box-shadow: 0 0 0 1.5px var(--accent);
  }

  &:not(.empty):not(.future):hover,
  &:not(.empty):not(.future):focus-visible {
    outline: 1.5px solid var(--accent);
    outline-offset: -0.5px;
  }

  &[tabindex='0'] {
    cursor: pointer;
  }
}

/* ---------- 底部统计与图例 ---------- */
.gh-cal-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.625rem;
  color: var(--muted);
  font-size: 11px;
}

.gh-legend {
  display: inline-flex;
  align-items: center;
  gap: 3px;

  i {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: var(--l0);

    &[data-level='1'] { background: var(--l1); }
    &[data-level='2'] { background: var(--l2); }
    &[data-level='3'] { background: var(--l3); }
    &[data-level='4'] { background: var(--l4); }
  }
}

.gh-cal-hint {
  margin: 4px 0 0;
  font-size: 10px;
  color: var(--muted);
  opacity: 0.75;
}

/* ---------- 提示框 ---------- */
.gh-tip {
  position: absolute;
  z-index: 10;
  transform: translate(-50%, calc(-100% - 8px));
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 10px;
  border-radius: 6px;
  background: #1f2328;
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  animation: gh-tip-in 0.15s ease;

  span {
    opacity: 0.85;
    font-size: 11px;
  }

  &.align-left {
    transform: translate(-15%, calc(-100% - 8px));
  }

  &.align-right {
    transform: translate(-85%, calc(-100% - 8px));
  }
}

/* ---------- 骨架屏 / 错误态 ---------- */
.gh-cal-skeleton {
  .sk-head,
  .sk-grid {
    border-radius: 8px;
    background-image: linear-gradient(
      90deg,
      rgba(128, 128, 128, 0.12) 25%,
      rgba(128, 128, 128, 0.22) 50%,
      rgba(128, 128, 128, 0.12) 75%
    );
    background-size: 200% 100%;
    animation: gh-shimmer 1.4s ease-in-out infinite;
  }

  .sk-head {
    height: 20px;
    width: 40%;
    margin-bottom: 10px;
  }

  .sk-grid {
    height: 118px;
    background-image:
      radial-gradient(rgba(128, 128, 128, 0.25) 2.5px, transparent 3px),
      linear-gradient(
        90deg,
        rgba(128, 128, 128, 0.08) 25%,
        rgba(128, 128, 128, 0.18) 50%,
        rgba(128, 128, 128, 0.08) 75%
      );
    background-size:
      14px 14px,
      200% 100%;
    animation: gh-shimmer-grid 1.4s ease-in-out infinite;
  }
}

.gh-cal-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 7.5rem;
  color: var(--muted);
  font-size: 13px;
}

/* ---------- 动画 ---------- */
@keyframes gh-pop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes gh-tip-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes gh-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes gh-shimmer-grid {
  0% {
    background-position: 0 0, 200% 0;
  }
  100% {
    background-position: 0 0, -200% 0;
  }
}

.ghfade-enter-active,
.ghfade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.ghfade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.ghfade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ---------- 响应式 ---------- */
@media (max-width: 640px) {
  .gh-cal {
    --cell: 9px;
    --gap: 2px;
    --wk: 16px;

    padding: 0.875rem 0.875rem;
  }

  .gh-cal-link span {
    display: none;
  }

  .gh-cal-link {
    padding: 0.4rem;
  }

  .gh-cal-sub {
    display: none;
  }
}

/* ---------- 减少动态效果偏好 ---------- */
@media (prefers-reduced-motion: reduce) {
  .gh-cal,
  .gh-cal * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
