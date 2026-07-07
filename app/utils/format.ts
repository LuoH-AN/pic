/**
 * 文件大小 / 日期格式化。用于文件列表展示。
 */

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

export function formatFileSize(bytes?: number): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes === 0) return '0 B'
  const unitIndex = Math.min(SIZE_UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  const value = bytes / Math.pow(1024, unitIndex)
  // B 不带小数；其余保留 1 位（≥100 时去掉小数避免过长）。
  const digits = unitIndex === 0 ? 0 : value >= 100 ? 0 : 1
  return `${value.toFixed(digits)} ${SIZE_UNITS[unitIndex]}`
}

export function formatDate(iso?: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
