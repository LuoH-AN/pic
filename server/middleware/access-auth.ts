import { createError, defineEventHandler, getRequestURL, sendRedirect } from 'h3'
import { isAccessAuthenticated, isAccessProtectionEnabled } from '~~/server/utils/access'

const PUBLIC_PATHS = new Set([
  '/favicon.ico',
  '/robots.txt',
])

const PUBLIC_PREFIXES = [
  '/_nuxt/',
  '/__nuxt_error',
  '/api/auth/',
]

function isPublicPath(pathname: string) {
  if (pathname === '/login' || pathname.startsWith('/login/')) return true
  if (PUBLIC_PATHS.has(pathname)) return true
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export default defineEventHandler(async (event) => {
  if (!isAccessProtectionEnabled(event)) return

  const { pathname, search } = getRequestURL(event)
  if (isPublicPath(pathname)) return
  if (isAccessAuthenticated(event)) return

  if (pathname.startsWith('/api/')) {
    throw createError({ statusCode: 401, message: '未登录，无法访问接口' })
  }

  const next = `${pathname}${search || ''}`
  return sendRedirect(event, `/login?redirect=${encodeURIComponent(next)}`, 302)
})
