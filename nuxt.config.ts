// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-02-05',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    accessPassword: process.env.ACCESS_PASSWORD || '',
    s3Endpoint: process.env.S3_ENDPOINT || '',
    s3Region: process.env.S3_REGION || 'auto',
    s3Bucket: process.env.S3_BUCKET || '',
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    s3UploadDir: process.env.S3_UPLOAD_DIR || '',
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
