import { defineEventHandler } from 'h3'

// 配置存储 API
// 实际数据存储在浏览器本地存储中
// 此 API 可用于验证配置或返回空响应

export default defineEventHandler(async (event) => {
  return { success: true, message: '配置已保存到本地存储' }
})
