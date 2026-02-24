import { createError, defineEventHandler, readBody } from 'h3'
import {
  establishAccessSession,
  isAccessProtectionEnabled,
  verifyAccessPassword,
} from '~~/server/utils/access'

export default defineEventHandler(async (event) => {
  if (!isAccessProtectionEnabled(event)) {
    return { success: true, enabled: false, authenticated: true }
  }

  const body = await readBody<{ password?: string }>(event)
  const ok = verifyAccessPassword(event, body?.password)
  if (!ok) {
    throw createError({ statusCode: 401, message: '访问密码错误' })
  }

  establishAccessSession(event)
  return { success: true, enabled: true, authenticated: true }
})
