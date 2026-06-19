import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { deleteCookie, getCookie, setCookie } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { H3Event } from 'h3'

const ACCESS_COOKIE_NAME = 'pic-access-token'
const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function hashText(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function getConfiguredAccessPassword(event: H3Event) {
  const runtimeConfig = useRuntimeConfig(event)
  return String(runtimeConfig.accessPassword || '').trim()
}

export function isAccessProtectionEnabled(event: H3Event) {
  return Boolean(getConfiguredAccessPassword(event))
}

// 会话令牌 = HMAC(secret, "pic-access:" + password)。
// 配置了 AUTH_SECRET 时，cookie 不再由密码单独派生，即使 cookie 泄露也无法离线还原/爆破出密码；
// 未配置时退回用密码派生（安全性与旧实现相当，但不再是可直接比对的裸 sha256(password)）。
function getExpectedAccessToken(event: H3Event) {
  const password = getConfiguredAccessPassword(event)
  if (!password) return ''
  const runtimeConfig = useRuntimeConfig(event)
  const secret = String(runtimeConfig.authSecret || '').trim() || `pic::${password}`
  return createHmac('sha256', secret).update(`pic-access:${password}`).digest('hex')
}

export function verifyAccessPassword(event: H3Event, password: unknown) {
  if (!isAccessProtectionEnabled(event)) return true
  const expected = getConfiguredAccessPassword(event)
  const candidate = typeof password === 'string' ? password : String(password || '')
  // 用 sha256 后做定时安全比较，避免不同长度带来的旁路。
  return safeEqual(hashText(candidate), hashText(expected))
}

export function isAccessAuthenticated(event: H3Event) {
  if (!isAccessProtectionEnabled(event)) return true
  const token = getCookie(event, ACCESS_COOKIE_NAME) || ''
  const expectedToken = getExpectedAccessToken(event)
  if (!token || !expectedToken) return false
  return safeEqual(token, expectedToken)
}

export function establishAccessSession(event: H3Event) {
  const token = getExpectedAccessToken(event)
  if (!token) return

  setCookie(event, ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE,
  })
}

export function clearAccessSession(event: H3Event) {
  deleteCookie(event, ACCESS_COOKIE_NAME, { path: '/' })
}
