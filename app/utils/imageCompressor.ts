import type { CompressConfig } from '~~/types'

// 客户端图片压缩。
// - jpg / png / webp：浏览器原生 canvas.toBlob 即可真实编码（现代浏览器均支持 webp 编码）。
// - avif：浏览器无法用 canvas 编码，改用 jSquash(WASM) 在 Web Worker 内真实编码。
// 解码 + 缩放在主线程用 createImageBitmap + canvas 完成（很快），重活（AVIF 编码）才丢给 Worker。

type TargetFormat = CompressConfig['format']

const MIME: Record<TargetFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
}

const EXTENSION: Record<TargetFormat, string> = {
  jpg: 'jpg',
  png: 'png',
  webp: 'webp',
  avif: 'avif',
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const replaceExtension = (name: string, ext: string) => `${name.replace(/\.[^/.]+$/, '')}.${ext}`

const resolveMaxDimension = (file: File) => {
  const sizeMb = file.size / (1024 * 1024)
  if (sizeMb >= 12) return 2560
  if (sizeMb >= 6) return 3072
  return 3840
}

// 解码并按需缩放，返回承载像素的 canvas。
// createImageBitmap 对某些图片会解码失败（HEIC 套 .jpg 后缀、CMYK / 带 ICC 的特殊
// JPEG、损坏图等）。先试 createImageBitmap（最快），失败再用 <img>.decode() 兜底
// （浏览器 <img> 解码器更宽容，能解部分 createImageBitmap 解不了的图）。
const drawToCanvas = async (source: Blob, maxDimension: number): Promise<HTMLCanvasElement> => {
  const natural = await decodeToNaturalSize(source)
  try {
    let width = natural.width
    let height = natural.height
    const longest = Math.max(width, height)
    if (maxDimension > 0 && longest > maxDimension) {
      const scale = maxDimension / longest
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

// ---- AVIF Worker（单例，懒加载）----
let avifWorker: Worker | null = null
let avifSeq = 0
const avifPending = new Map<number, { resolve: (buffer: ArrayBuffer) => void; reject: (error: Error) => void }>()

const getAvifWorker = (): Worker => {
  if (avifWorker) return avifWorker

  const worker = new Worker(new URL('../workers/avifEncoder.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (event: MessageEvent) => {
    const { id, ok, buffer, error } = event.data || {}
    const pending = avifPending.get(id)
    if (!pending) return
    avifPending.delete(id)
    if (ok) pending.resolve(buffer)
    else pending.reject(new Error(error || 'AVIF 编码失败'))
  }
  worker.onerror = () => {
    for (const pending of avifPending.values()) {
      pending.reject(new Error('AVIF 编码 Worker 异常'))
    }
    avifPending.clear()
  }

  avifWorker = worker
  return worker
}

const encodeAvif = async (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法获取 canvas 2d 上下文')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const worker = getAvifWorker()
  const id = ++avifSeq

  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    avifPending.set(id, { resolve, reject })
    // 传 buffer 的副本并 transfer，避免主线程的 imageData 被 detach。
    const copy = imageData.data.buffer.slice(0)
    worker.postMessage({ id, data: copy, width: canvas.width, height: canvas.height, quality }, [copy])
  })

  return new Blob([buffer], { type: 'image/avif' })
}

// 压缩用于上传的图片，返回携带正确类型/后缀的 File。
export const compressImageForUpload = async (file: File, config: CompressConfig): Promise<File> => {
  const quality = clamp(Math.round(config.quality), 1, 100)
  const canvas = await drawToCanvas(file, resolveMaxDimension(file))
  const format = config.format

  if (format === 'avif') {
    try {
      const blob = await encodeAvif(canvas, quality)
      return new File([blob], replaceExtension(file.name, EXTENSION.avif), {
        type: MIME.avif,
        lastModified: file.lastModified,
      })
    } catch (error) {
      // AVIF 编码失败（少数环境不支持 WASM/Worker）时，降级为真实 WebP，保证上传不中断。
      console.warn('AVIF 编码失败，降级为 WebP:', error)
      const webpBlob = await canvasToBlob(canvas, MIME.webp, quality / 100)
      return new File([webpBlob], replaceExtension(file.name, EXTENSION.webp), {
        type: MIME.webp,
        lastModified: file.lastModified,
      })
    }
  }

  // png 为无损，quality 不生效；jpg/webp 使用质量参数。
  const blob = format === 'png'
    ? await canvasToBlob(canvas, MIME.png)
    : await canvasToBlob(canvas, MIME[format], quality / 100)

  return new File([blob], replaceExtension(file.name, EXTENSION[format]), {
    type: MIME[format],
    lastModified: file.lastModified,
  })
}

// 生成上传列表用的小缩略图（原生 WebP，快速、无需 WASM）。失败返回空串。
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
