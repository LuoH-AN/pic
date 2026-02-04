// @ts-ignore
import { randomBytes, createHash } from 'crypto'
import type { RenameConfig } from '~/types'

export async function generateFilename(
  renameConfig: RenameConfig,
  originalFilename: string
): Promise<string> {
  const strategy = renameConfig?.strategy || 'timestamp'
  const customFormat = renameConfig?.customFormat || '{filename}'

  if (strategy === 'timestamp') {
    const timestamp = Date.now()
    const ext = originalFilename.split('.').pop() || ''
    return `${timestamp}.${ext}`
  }

  if (strategy === 'random') {
    const randomStr = randomBytes(8).toString('hex')
    const ext = originalFilename.split('.').pop() || ''
    return `${randomStr}.${ext}`
  }

  if (strategy === 'custom') {
    const now = new Date()
    const replacements: { [key: string]: () => string } = {
      '{Y}': () => String(now.getFullYear()),
      '{y}': () => String(now.getFullYear()).slice(-2),
      '{m}': () => String(now.getMonth() + 1).padStart(2, '0'),
      '{d}': () => String(now.getDate()).padStart(2, '0'),
      '{h}': () => String(now.getHours()).padStart(2, '0'),
      '{i}': () => String(now.getMinutes()).padStart(2, '0'),
      '{s}': () => String(now.getSeconds()).padStart(2, '0'),
      '{ms}': () => String(now.getMilliseconds()).padStart(3, '0'),
      '{timestamp}': () => String(now.getTime()),
      '{uuid}': () => randomBytes(16).toString('hex'),
      '{md5}': () => createHash('md5').update(randomBytes(16)).digest('hex'),
      '{md5-16}': () => createHash('md5').update(randomBytes(16)).digest('hex').substring(0, 16),
      '{filename}': () => originalFilename.replace(/\.[^/.]+$/, ''),
    }

    let newName = customFormat

    // Handle {str-number} separately
    newName = newName.replace(/{str-(\d+)}/g, (_: string, num: string) => {
      const len = parseInt(num, 10)
      return randomBytes(Math.ceil(len / 2)).toString('hex').substring(0, len)
    })

    for (const placeholder in replacements) {
      if (newName.includes(placeholder)) {
        newName = newName.replace(new RegExp(placeholder, 'g'), replacements[placeholder]())
      }
    }

    const ext = originalFilename.split('.').pop() || ''
    if (ext) {
      return `${newName}.${ext}`
    }
    return newName
  }

  // Fallback to original filename
  return originalFilename
}
