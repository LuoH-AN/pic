# Pic - S3 图片上传与管理

基于 Nuxt 4 的图片工具，支持：
- 上传图片（可选压缩、重命名策略）
- 浏览 S3 目录与图片预览
- 删除、重命名图片

## 关键安全设计

- S3 密钥只在服务端环境变量中保存，不再由浏览器传入。
- 前端只保存非敏感配置（重命名/压缩策略）。
- 上传采用“签名直传 S3”模式，文件二进制不会经过 Vercel Function。
- 删除与重命名接口只允许操作 `S3_UPLOAD_DIR` 作用域内的对象。

## 环境变量（Vercel）

在 Vercel 项目里配置以下变量：

```bash
S3_ENDPOINT=
S3_REGION=auto
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_UPLOAD_DIR=            # 可选，例如 images

S3_PUBLIC_BASE_URL=       # 可选，优先使用（推荐）
S3_PUBLIC_ENDPOINT=       # 可选，未配置 PUBLIC_BASE_URL 时作为回退

MAX_UPLOAD_SIZE_MB=20     # 可选，默认 20
MAX_UPLOAD_COUNT=50       # 可选，默认 50
ACCESS_PASSWORD=          # 可选，配置后启用访问密码；留空则关闭
```

说明：
- `S3_PUBLIC_BASE_URL` 建议填 CDN 或可公开访问的前缀域名。
- 如果不填 `S3_PUBLIC_BASE_URL`，前端会尝试拼接 `S3_PUBLIC_ENDPOINT/S3_BUCKET/...`。
- `ACCESS_PASSWORD` 配置后，访问站点需先输入密码；未登录时无法调用上传、文件列表、删除、重命名等 API。
- 上传页使用 `browser-image-compression`（Web Worker）先做客户端压缩与缩略图生成，避免大图导致页面白屏。
- 上传流程为：先请求 `/api/s3/presign` 获取签名 URL，再由浏览器直接 `PUT` 到 S3。
- 需要在对象存储配置 CORS，允许站点域名对 Bucket 发起 `PUT` 请求并携带 `Content-Type` 头。

## 本地开发

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
pnpm preview
```
