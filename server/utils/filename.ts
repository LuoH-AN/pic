import { randomBytes, createHash } from 'crypto'
import { sanitizeRelativeFilePath } from '~~/server/utils/config'
import type { RenameConfig } from '~~/types'

function getExtension(filename: string) {
  const ext = filename.split('.').pop()?.trim()
  if (!ext || ext === filename) return ''
  return ext
}

function applyRenamePlaceholders(format: string, originalFilename: string) {
  const now = new Date()
  const replacements: Record<string, () => string> = {
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

  let newName = format
  newName = newName.replace(/{str-(\d+)}/g, (_: string, num: string) => {
    const len = Math.max(1, Number.parseInt(num, 10) || 1)
    return randomBytes(Math.ceil(len / 2)).toString('hex').substring(0, len)
  })

  for (const [placeholder, factory] of Object.entries(replacements)) {
    if (!newName.includes(placeholder)) continue
    newName = newName.replaceAll(placeholder, factory())
  }

  return newName
}

export async function generateFilename(renameConfig: RenameConfig, originalFilename: string): Promise<string> {
  const strategy = renameConfig?.strategy || 'timestamp'
  const customFormat = renameConfig?.customFormat || '{filename}'
  const ext = getExtension(originalFilename)

  let baseName = ''
  if (strategy === 'timestamp') {
    baseName = String(Date.now())
  } else if (strategy === 'random') {
    baseName = randomBytes(8).toString('hex')
  } else if (strategy === 'custom') {
    baseName = applyRenamePlaceholders(customFormat, originalFilename)
  } else {
    baseName = originalFilename.replace(/\.[^/.]+$/, '')
  }

  const finalName = ext ? `${baseName}.${ext}` : baseName
  return sanitizeRelativeFilePath(finalName, '生成的文件名')
}
