import type { CompressConfig } from '~~/types'

// 客户端图片压缩。jpg / png / webp 均用浏览器原生 canvas.toBlob 真实编码
// （现代浏览器都支持 webp 编码，速度快、零 WASM 依赖）。
// 解码 + 缩放在主线程用 createImageBitmap + canvas 完成。

type TargetFormat = CompressConfig['format']

const MIME: Record<TargetFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const EXTENSION: Record<TargetFormat, string> = {
  jpg: 'jpg',
  png: 'png',
  webp: 'webp',
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const replaceExtension = (name: string, ext: string) => `${name.replace(/\.[^/.]+$/, '')}.${ext}`

// 按实际分辨率决定压缩/编码时的最长边上限。按分辨率（而非 file.size）判断更准——
// 压缩过的 jpg 可能体积小但分辨率高。压缩图 2048 边长足够（屏幕/打印都够用），
// 像素量从 ~12MP 降到 ~4MP，编码更快。
const resolveMaxDimension = (width: number, height: number) => {
  const longest = Math.max(width, height)
  if (longest >= 6000) return 2880
  if (longest >= 4000) return 2560
  if (longest >= 3000) return 2304
  return 2048
}

// 解码并按需缩放，返回承载像素的 canvas。
// createImageBitmap 对某些图片会解码失败（HEIC 套 .jpg 后缀、CMYK / 带 ICC 的特殊
// JPEG、损坏图等）。先试 createImageBitmap（最快），失败再用 <img>.decode() 兜底
// （浏览器 <img> 解码器更宽容，能解部分 createImageBitmap 解不了的图）。
// maxDimension: 0 = 按解码后分辨率自动决定（用于压缩）；正数 = 固定上限（用于缩略图）。
const drawToCanvas = async (source: Blob, maxDimension: number): Promise<HTMLCanvasElement> => {
  const natural = await decodeToNaturalSize(source)
  try {
    let width = natural.width
    let height = natural.height
    const longest = Math.max(width, height)
    const limit = maxDimension > 0 ? maxDimension : resolveMaxDimension(width, height)
    if (limit > 0 && longest > limit) {
      const scale = limit / longest
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法获取 canvas 2d 上下文')
    natural.drawTo(ctx, width, height)
    return canvas
  } finally {
    natural.close?.()
  }
}

// 第一优先级：createImageBitmap（同步路径快、且能用 transfer/out 副本）。
const decodeViaBitmap = (source: Blob) =>
  createImageBitmap(source).then(bitmap => ({
    width: bitmap.width,
    height: bitmap.height,
    drawTo: (ctx: CanvasRenderingContext2D, w: number, h: number) => ctx.drawImage(bitmap, 0, 0, w, h),
    close: () => bitmap.close?.(),
  }))

// 兜底：<img> + decode()。部分图（带 ICC / 某些 CMYK JPEG）这里能解出来。
const decodeViaImage = async (source: Blob) => {
  const url = URL.createObjectURL(source)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      drawTo: (ctx: CanvasRenderingContext2D, w: number, h: number) => ctx.drawImage(img, 0, 0, w, h),
      close: () => {},
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

const decodeToNaturalSize = async (source: Blob) => {
  try {
    return await decodeViaBitmap(source)
  } catch (error) {
    console.warn('createImageBitmap 解码失败，回退 <img> 解码:', error)
    return decodeViaImage(source)
  }
}

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('canvas.toBlob 返回空'))),
      type,
      quality,
    )
  })
}

// 压缩用于上传的图片，返回携带正确类型/后缀的 File。
export const compressImageForUpload = async (file: File, config: CompressConfig): Promise<File> => {
  const quality = clamp(Math.round(config.quality), 1, 100)
  const canvas = await drawToCanvas(file, 0)
  const format = config.format

  // png 为无损，quality 不生效；jpg/webp 使用质量参数。
  const blob = format === 'png'
    ? await canvasToBlob(canvas, MIME.png)
    : await canvasToBlob(canvas, MIME[format], quality / 100)

  return new File([blob], replaceExtension(file.name, EXTENSION[format]), {
    type: MIME[format],
    lastModified: file.lastModified,
  })
}

// 生成上传列表用的小缩略图（原生 WebP，快速）。失败返回空串。
export const makePreviewObjectUrl = async (file: File): Promise<string> => {
  try {
    const canvas = await drawToCanvas(file, 1280)
    const blob = await canvasToBlob(canvas, MIME.webp, 0.72)
    return URL.createObjectURL(blob)
  } catch (error) {
    console.warn('生成预览缩略图失败:', error)
    return ''
  }
}
