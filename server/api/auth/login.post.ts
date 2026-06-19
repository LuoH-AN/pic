import { createError, defineEventHandler, readBody, getRequestIP } from 'h3'
import {
  establishAccessSession,
  isAccessProtectionEnabled,
  verifyAccessPassword,
} from '~~/server/utils/access'

// 简易内存登录限流：每个 IP 在时间窗口内最多尝试若干次，抬高暴力破解成本。
// 注意：Serverless 多实例下各自计数、实例回收会重置，属 best-effort。
const WINDOW_MS = 5 * 60 * 1000
const MAX_ATTEMPTS = 10
const attempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  entry.count += 1
  return entry.count <= MAX_ATTEMPTS
}

export default defineEventHandler(async (event) => {
  if (!isAccessProtectionEnabled(event)) {
    return { success: true, enabled: false, authenticated: true }
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  if (!checkRateLimit(ip)) {
    throw createError({ statusCode: 429, message: '尝试过于频繁，请稍后再试' })
  }

  const body = await readBody<{ password?: string }>(event)
  const ok = verifyAccessPassword(event, body?.password)
  if (!ok) {
    throw createError({ statusCode: 401, message: '访问密码错误' })
  }

  attempts.delete(ip)
  establishAccessSession(event)
  return { success: true, enabled: true, authenticated: true }
})
