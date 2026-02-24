// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-02-05',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    s3Endpoint: process.env.S3_ENDPOINT || '',
    s3Region: process.env.S3_REGION || 'auto',
    s3Bucket: process.env.S3_BUCKET || '',
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    s3UploadDir: process.env.S3_UPLOAD_DIR || '',
    imageCompressMaxWidth: Number(process.env.IMAGE_COMPRESS_MAX_WIDTH || 2560),
    imageCompressMaxHeight: Number(process.env.IMAGE_COMPRESS_MAX_HEIGHT || 2560),
    imageCompressMaxPixels: Number(process.env.IMAGE_COMPRESS_MAX_PIXELS || 60000000),
    imageCompressFastModeThresholdMb: Number(process.env.IMAGE_COMPRESS_FAST_MODE_THRESHOLD_MB || 4),
    imageCompressAggressiveThresholdMb: Number(
      process.env.IMAGE_COMPRESS_AGGRESSIVE_THRESHOLD_MB
      || process.env.IMAGE_COMPRESS_SKIP_THRESHOLD_MB
      || 8,
    ),
    imageCompressFastModeMaxDimension: Number(process.env.IMAGE_COMPRESS_FAST_MODE_MAX_DIMENSION || 1600),
    imageCompressTimeoutMs: Number(process.env.IMAGE_COMPRESS_TIMEOUT_MS || 5000),
    public: {
      s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL || '',
      s3PublicEndpoint: process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT || '',
      s3Bucket: process.env.S3_BUCKET || '',
      s3UploadDir: process.env.S3_UPLOAD_DIR || '',
      maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 20),
      maxUploadCount: Number(process.env.MAX_UPLOAD_COUNT || 50),
    },
  },
  app: {
    pageTransition: {
      name: 'page-fade',
      mode: 'out-in',
    },
  },
})
