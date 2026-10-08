/**
 * @file Article getter
 * @module server.getter.article
 * @author CGmoke <https://github.com/CGmoke>
 */

import fs from 'fs';
import fg from 'fast-glob';
import matter from 'gray-matter';

export async function getArticleData() {
  const codingPosts = await fg('src/pages/coding/**/*.md');
  const blogPosts = await fg('src/pages/blog/**/*.md');
  const reship = await fg('src/pages/reship/**/*.md');

  const modifiedDates = [...codingPosts, ...blogPosts, ...reship].map(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const result = matter(content);
    const date = result.data.date;
    const parsedDate = date instanceof Date ? date : new Date(String(date));
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid or missing article date in ${file}: ${String(date)}`);
    }
    return parsedDate.toISOString().split('T')[0];
  });

  const article = {
    totalContributions: modifiedDates.length,
    weeks: [
      {
        contributionDays: modifiedDates.map((date) => ({
          weekday: 0,
          date: date,
          contributionCount: 1,
          color: '#FCC580',
        })),
      },
    ],
  };
  return article;
}
