import { defineEventHandler } from 'h3'
import { isAccessAuthenticated, isAccessProtectionEnabled } from '~~/server/utils/access'

export default defineEventHandler(async (event) => {
  const enabled = isAccessProtectionEnabled(event)
  const authenticated = enabled ? isAccessAuthenticated(event) : true
  return { enabled, authenticated }
})
