/**
 * 按扩展名判断文件类别（用于选择展示图标 / 缩略图）。
 * 与 useS3Files 中的图片判定保持一致。
 */

export type FileKind = 'image' | 'video' | 'audio' | 'archive' | 'code' | 'text' | 'pdf' | 'other'

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'])
const VIDEO_EXT = new Set(['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'm4v', 'wmv', 'mpeg', 'mpg'])
const AUDIO_EXT = new Set(['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'opus'])
const ARCHIVE_EXT = new Set(['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'])
const CODE_EXT = new Set(['js', 'ts', 'jsx', 'tsx', 'json', 'html', 'css', 'scss', 'vue', 'py', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'hpp', 'sh', 'yml', 'yaml', 'xml'])
const TEXT_EXT = new Set(['txt', 'log', 'csv', 'md', 'rtf'])
const PDF_EXT = new Set(['pdf'])

export function getExt(name: string): string {
  return (name.split('.').pop() || '').toLowerCase()
}

export function isImageFile(name: string): boolean {
  return IMAGE_EXT.has(getExt(name))
}

const KIND_SETS: Array<{ kind: FileKind, set: Set<string> }> = [
  { kind: 'image', set: IMAGE_EXT },
  { kind: 'video', set: VIDEO_EXT },
  { kind: 'audio', set: AUDIO_EXT },
  { kind: 'archive', set: ARCHIVE_EXT },
  { kind: 'pdf', set: PDF_EXT },
  { kind: 'code', set: CODE_EXT },
  { kind: 'text', set: TEXT_EXT },
]

export function getFileKind(name: string): FileKind {
  const ext = getExt(name)
  for (const { kind, set } of KIND_SETS) {
    if (set.has(ext)) return kind
  }
  return 'other'
}
