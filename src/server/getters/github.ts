/**
 * @file GitHub getter
 * @module server.getter.github
 * @author CGmoke <https://github.com/CGmoke>
 */

// Reference: @author Surmon <https://github.com/surmon-china>

import axios from '../services/axios'

// 可选：在 .env 或部署平台环境变量中配置 PUBLIC_GITHUB_TOKEN（https://github.com/settings/tokens）。
// 未配置时，贡献日历会优雅降级为空数据，不影响页面展示。
const TOKEN = import.meta.env.PUBLIC_GITHUB_TOKEN || ''

const EMPTY_CONTRIBUTION = {
  totalContributions: 0,
  weeks: [],
}

const graphqlGitHub = <T = any>(query: string): Promise<T> => {
  return axios
    .request<any>({
      headers: { Authorization: `bearer ${TOKEN}` },
      url: `https://api.github.com/graphql`,
      method: 'POST',
      data: JSON.stringify({
        query: `query {
        user(login: "CGmoke") {
          ${query}
        }
      }`
      })
    })
    .then((response: { data: { errors: any[]; data: { user: any } } }) => {
      return response.data.errors
        ? Promise.reject(response.data.errors.map((error) => error.message).join('; '))
        : Promise.resolve(response.data.data.user)
    })
}

const isISODateString = (dateString: string) => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(dateString)) return false
  return new Date(dateString).toISOString() === dateString
}

export const getGitHubContributions = async (from: string, to: string): Promise<any> => {
  if (!isISODateString(from) || !isISODateString(to)) {
    return Promise.reject('Invalid date string!')
  }

  // 未配置 Token 时直接返回空数据，避免请求失败与浏览器报错
  if (!TOKEN) {
    return EMPTY_CONTRIBUTION
  }

  const result = await graphqlGitHub(`
    contributionsCollection(from: "${from}", to: "${to}") {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            weekday
            date
            contributionCount
            color
          }
        }
      }
    }
  `)

  return result.contributionsCollection.contributionCalendar
}
