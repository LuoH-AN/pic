import { defineEventHandler } from 'h3'
import { clearAccessSession } from '~~/server/utils/access'

export default defineEventHandler(async (event) => {
  clearAccessSession(event)
  return { success: true }
})
