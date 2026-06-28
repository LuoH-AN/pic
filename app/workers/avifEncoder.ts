// Web Worker：在后台线程用 jSquash(WASM) 把像素数据编码为 AVIF。
// 浏览器的 canvas.toBlob 无法编码 AVIF，因此 AVIF 必须走 WASM；放在 Worker 里避免阻塞主线程导致页面卡顿。
import { encode } from '@jsquash/avif'

interface EncodeRequest {
  id: number
  data: ArrayBuffer
  width: number
  height: number
  quality: number
}

const ctx = self as unknown as Worker

ctx.onmessage = async (event: MessageEvent<EncodeRequest>) => {
  const { id, data, width, height, quality } = event.data
  try {
    const imageData = { data: new Uint8ClampedArray(data), width, height }
    // jSquash 的 quality 取值 0-100（越大越好），speed 取值 0-10（越大越快、体积略增）。
    // speed=9：编码速度数倍提升，体积略增；在低质量档下视觉差异极小，适合上传压缩场景。
    const buffer = await encode(imageData as ImageData, { quality, speed: 9 })
    ctx.postMessage({ id, ok: true, buffer }, [buffer])
  } catch (error) {
    ctx.postMessage({
      id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
