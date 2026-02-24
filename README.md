# Pic - S3 图片上传与管理

基于 Nuxt 4 的图片工具，支持：
- 上传图片（可选压缩、重命名策略）
- 浏览 S3 目录与图片预览
- 删除、重命名图片

## 关键安全设计

- S3 密钥只在服务端环境变量中保存，不再由浏览器传入。
- 前端只保存非敏感配置（重命名/压缩策略）。
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

IMAGE_COMPRESS_MAX_WIDTH=2560              # 可选，默认 2560
IMAGE_COMPRESS_MAX_HEIGHT=2560             # 可选，默认 2560
IMAGE_COMPRESS_MAX_PIXELS=60000000         # 可选，默认 6000 万像素
IMAGE_COMPRESS_FAST_MODE_THRESHOLD_MB=4    # 可选，超过后启用快速压缩
IMAGE_COMPRESS_AGGRESSIVE_THRESHOLD_MB=8   # 可选，超过后启用增强压缩档位
IMAGE_COMPRESS_FAST_MODE_MAX_DIMENSION=1600 # 可选，快速模式下最大宽高
IMAGE_COMPRESS_TIMEOUT_MS=5000             # 可选，单档压缩超时阈值（超时会自动切换下一压缩档）
```

说明：
- `S3_PUBLIC_BASE_URL` 建议填 CDN 或可公开访问的前缀域名。
- 如果不填 `S3_PUBLIC_BASE_URL`，前端会尝试拼接 `S3_PUBLIC_ENDPOINT/S3_BUCKET/...`。
- `ACCESS_PASSWORD` 配置后，访问站点需先输入密码；未登录时无法调用上传、文件列表、删除、重命名等 API。
- 上传页使用 `browser-image-compression`（Web Worker）先做客户端压缩与缩略图生成，避免大图导致页面白屏。
- 仅当开启压缩时，服务端才会执行压缩。
- 开启压缩后，图片必须压缩成功才会上传；失败会直接返回错误，不会回退上传原图。

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
