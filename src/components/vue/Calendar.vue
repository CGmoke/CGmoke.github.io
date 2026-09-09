<script lang="ts" setup>
import { computed, onMounted } from "vue";
import CalendarDay from "./Oneday.vue";
import { dateToHuman, humanDateToYMD, type HumanDate } from "@/utils/moment";
import { getGitHubContributions } from "@/server/getters/github";

let data = null;
const props = defineProps<{
  article: any;
}>();

// 计算合适的日期范围：覆盖最早文章日期 ~ 现在
const allArticleDates = computed(() => {
  const dates: string[] = [];
  for (const week of props.article?.weeks || []) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) dates.push(day.date);
    }
  }
  return dates.sort();
});

const now = new Date();
const nowYear = now.getFullYear();
const nowMonth = now.getMonth();

// 起始月份：取最早文章日期或"现在-7个月"，取更早的
let startYear = nowYear;
let startMonth = nowMonth - 7; // 默认过去7个月
while (startMonth < 0) {
  startMonth += 12;
  startYear -= 1;
}

if (allArticleDates.value.length > 0) {
  const earliest = allArticleDates.value[0];
  const earliestYear = parseInt(earliest.split("-")[0]);
  const earliestMonth = parseInt(earliest.split("-")[1]) - 1; // JS month 0-indexed
  if (
    earliestYear < startYear ||
    (earliestYear === startYear && earliestMonth <= startMonth)
  ) {
    startYear = earliestYear;
    startMonth = earliestMonth;
  }
}

// 生成月份列表（从 startYear/startMonth 到现在）
const months: { year: number; month: number; days: string[] }[] = [];
let curYear = startYear;
let curMonth = startMonth;
while (
  curYear < nowYear ||
  (curYear === nowYear && curMonth <= nowMonth)
) {
  const target = new Date(curYear, curMonth, 0);
  const daysCount = target.getDate();
  const monthDays = Array.from({ length: daysCount }).map((_, i) =>
    humanDateToYMD({ ...dateToHuman(target), day: i + 1 })
  );
  months.push({ year: curYear, month: curMonth, days: monthDays });

  curMonth++;
  if (curMonth > 11) {
    curMonth = 0;
    curYear++;
  }
}

// GitHub 贡献数据（用实际范围）
const startISO = new Date(startYear, startMonth, 1).toISOString();
const endISO = now.toISOString();

try {
  const res = await getGitHubContributions(startISO, endISO);
  data = res;
} catch (error) {
  console.error("Error reading data:", error);
}

const createContributionsMap = (weeks: any) => {
  const contributionsMap = new Map();
  for (const week of weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        contributionsMap.set(day.date, {
          count: day.contributionCount,
          color: day.color,
        });
      }
    }
  }
  return contributionsMap;
};

const githubContributionsMap = computed(() => createContributionsMap(data?.weeks || []));

const articleContributionsMap = computed(() =>
  createContributionsMap(props.article.weeks)
);

const getDayContributions = (date: string) => {
  return githubContributionsMap.value.get(date)?.count || 0;
};

const getDayGitHubColor = (date: string) => {
  return githubContributionsMap.value.get(date)?.color;
};

const getDayArticles = (date: string) => {
  return articleContributionsMap.value.get(date)?.count || 0;
};

const onCalendarRendered = () => {
  const skeletonElement = document.getElementById("skeleton");
  if (skeletonElement) {
    skeletonElement.remove();
  }
};

onMounted(() => {
  onCalendarRendered();
});
</script>

<template>
  <div class="calendar bg-crystalClear dark:bg-slate-800" data-pagefind-ignore>
    <ul class="aggregate-calendar">
      <li
        v-for="(month, index) in months"
        :key="`${month.year}-${month.month}`"
        class="month"
        :title="`${month.year}-${String(month.month + 1).padStart(2, '0')}`"
      >
        <calendar-day
          v-for="(day, i) in month.days"
          :key="i"
          :date="day"
          :articles="getDayArticles(day)"
          :contributions="getDayContributions(day)"
          :github-color="getDayGitHubColor(day)"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";

.calendar {
  border-radius: 4px;
  padding: 0.8rem;
  transition: background-color 0.25s;
  width: 100%;
  min-width: 560px;
}

.aggregate-calendar {
  display: flex;
  justify-content: space-between;
  padding: 0;
  margin: 0;

  .month {
    width: auto;
    display: grid;
    grid-template-rows: repeat(7, 1fr);
    grid-auto-flow: column;
    grid-auto-columns: min-content;
    grid-gap: 3px;
    scroll-snap-align: start;
  }
}
</style>
