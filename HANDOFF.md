# 移交说明（HANDOFF）

> 本文档由 Claude 生成，记录当前项目状态、已完成的工作、以及**尚未完成的待办事项**，供其他开发者接手继续完成。

## 项目背景

`pic` 是一个基于 **Nuxt 4 + Vue 3** 的图片托管应用（S3 后端、客户端 AVIF/WebP 压缩、访问密码门禁、PhotoSwipe 看图）。

仓库：https://github.com/LuoH-AN/pic
当前分支：`main`，最新提交：`da85e01 style: 黑白灰扁平化 UI，移除全部渐变与阴影`

## 最近完成的两轮工作

### 第一轮：UI 体系迁移（提交 `c863ecd`）
从 `@nuxt/ui` + `@iconify` + 自写 scoped CSS，整体迁移到：
- **shadcn-vue + reka-ui**（reka-ui 即 Radix 团队的 Vue 线，Base UI 的 Vue 对应）
- **Tailwind CSS v4**（`@tailwindcss/vite`）+ `class-variance-authority` / `clsx` / `tailwind-merge` / `tw-animate-css`
- 图标统一用 **lucide-vue-next**

关键产物：
- `app/assets/css/main.css`：重写为 Tailwind v4 入口（`@import "tailwindcss"` + shadcn token 命名空间）
- `app/components/ui/`：35 个基于 reka-ui 的 shadcn 原语（Button/Input/Card/Dialog/DropdownMenu/ContextMenu/RadioGroup/Switch/Toaster 等）
- `app/lib/utils.ts`（`cn()`）/ `app/lib/variants.ts`（`buttonVariants`）
- `components.json`（shadcn CLI 配置）
- 业务组件全部迁移到新原语；删掉了手写的 Modal 定位、上下文菜单定位等代码
- **业务逻辑（server API / composables / AVIF worker / PhotoSwipe / 上传配置存储）未动**

### 第二轮：黑白灰扁平化改造（提交 `da85e01`）
按用户要求把渐变、阴影、光晕全部移除，改为**黑白灰、无阴影、现代**风格：
- 配色改为 zinc 中性灰阶，主色随主题反转（亮色近黑 `#18181b` / 暗色近白 `#fafafa`）
- 全部组件去 `shadow-*`
- 去掉 `gradient` 按钮变体；徽章改为描边方块
- 图标单色化（复制/上传/重命名去色，仅保留删除的红色）
- 底部导航选中态改为实心反色填充

> 设计决策备注：**删除按钮保留了红色**（`destructive`），因为删除操作的警示色是通用 UX 惯例。如果需要**纯粹黑白灰连红色也去掉**，见下方「待定决策」。

### 第三轮：静态审查修复 3 个迁移回归（2026-06-28，未提交）

> ⚠️ 本次环境**未安装 Node/pnpm**，无法运行 `nuxt build` / `pnpm dev` / `vue-tsc`。下列 3 个 bug 均为**纯静态代码审查 + git 历史比对**定位并修复，**尚未在浏览器实跑复测**。请接手者在 node 环境复测后提交。

1. **PhotoSwipe 点击图片打不开大图（高优先级）** — `file.vue` 配置 `children: 'a.pswp-gallery-item'`，但迁移时 `ImageWall.vue` 的 `<a>` 丢了这个 class，选择器匹配不到任何元素 → `loadAndOpen` 拿到空数据源。已对比 v0.1.0（`b4ff0bf`）确认原版 `<a>` 有 `class="wall-item pswp-gallery-item"`。**修复**：在 `ImageWall.vue` 的 `<a>` 补回 `pswp-gallery-item`。
2. **上传/压缩进度 toast 堆叠（中）** — 原 `useAppToast` 是单 toast 模型（覆盖式），迁移改成列表追加后，上传循环里 `showLoadingToast` 每次追加一条 → 多条"正在处理图片预览"堆叠。**修复**：`showLoadingToast` 先清空队列再 push（恢复"同一时刻只有一个 loading toast"的语义）。
3. **右键/下拉菜单 destructive 项不变红（低/外观）** — `ContextMenuItem.vue`/`DropdownMenuItem.vue` 用 `data-[variant=destructive]` 选择器（匹配 `[data-variant="destructive"]`），但 `variant` 经 `useForwardPropsEmits` 原样转发给 reka-ui，reka-ui 菜单项没有该 prop → 渲染成普通属性 `variant="…"`（非 `data-variant`），选择器失效。**修复**：从转发中剥离 `class/inset/variant`，改为显式绑定 `:data-variant="variant"`。

附带**设计调整（两处判断，可回退）**：
- 主题切换按钮原先 `v-if="route.path === '/'"` 只在上传页显示；现改为**全局显示**（`default.vue`），与 HANDOFF「全局」描述一致（FOUC 脚本与主题持久化本就是全局的）。若只想在上传页显示可改回。
- HANDOFF「待定决策」里的「删除按钮保留红色」：本轮修复 #3 后，**右键菜单删除项也会正确变红**，与设计意图一致。

---

## ✅ 当前可确认完成的事

- ✅ 依赖替换、安装干净（`pnpm install` 无错误）
- ✅ `nuxt prepare` 生成类型成功
- ✅ **`nuxt build` 生产构建通过**（`✨ Build complete!`）
- ✅ 无残留 `@nuxt/ui` / `UInput` / 旧 CSS 变量引用
- ✅ 已推送到 `origin/main`

---

## ⚠️ 尚未完成的工作（接手者重点关注）

### 1. 浏览器实机冒烟验证（最重要）

**`nuxt build` 通过只代表代码能编译，不等于视觉和交互正确。** 目前还没有在真实浏览器里运行过一次。请接手者执行 `pnpm dev`，逐项验证以下场景：

> 🔁 本轮（第三轮）已修复 3 个回归，**冒烟时务必重点复测**：(a) `/file` 点击图片能打开 PhotoSwipe 大图；(b) 上传多张图片时只出现一条更新中的进度 toast、不堆叠；(c) 图片右键菜单的"删除图片"项是红色。

| 页面/功能 | 验证点 |
|---|---|
| 登录页 `/login` | 黑底主按钮、描边锁图标徽章、loading spinner、错误提示、回车提交 |
| 首页上传区 `/` | 虚线边框拖拽区、hover/dragover 配色变化、点击选文件、文件预览项、单张/全部上传、复制链接、删除 |
| 文件页 `/file` | 瀑布流图墙、PhotoSwipe 大图浏览、右键上下文菜单（复制/重命名/删除）、路径栏下拉切换目录、删除确认弹窗、重命名弹窗及非法名校验 |
| 配置页 `/config` | 压缩开关 Switch、压缩质量输入、输出格式 RadioGroup、重命名策略 RadioGroup、自定义格式输入、自动保存（400ms debounce） |
| 全局 | Toast 提示（右下方，3s 自动消失/可滑动关闭）、底部导航三页切换及选中态、右上角主题切换（亮/暗/跟随系统，无闪烁） |

**重点关注**：
- reka-ui 的 Dialog / DropdownMenu / ContextMenu / Switch / RadioGroup 的受控状态是否双向绑定正常（项目用的是 `v-model` = `modelValue` / `update:modelValue`）。
- 暗色模式下对比度是否可读（背景近黑 `#09090b`，文字近白）。
- Tailwind v4 工具类是否都正确生成（可在浏览器 DevTools 检查，如 `bg-card`、`text-foreground`、`data-[state=open]:animate-in`）。

### 2. 代码质量 / 类型检查（建议补做）

- 项目目前**没有配置 ESLint / Prettier / vue-tsc 类型检查脚本**。`nuxt build` 用的是 oxc 编译，不做严格类型检查。建议补一个 `vue-tsc --noEmit` 跑一遍，可能有类型告警（例如 reka-ui 的 `*Props` / `*Emits` 类型透传、`as` prop 类型）。
- `app/components/ui/*` 原语里部分用了 `useForwardPropsEmits`，可确认 reka-ui 升级时这些 API 仍兼容。

### 3. 部署 / 运行时验证（未做）

- 只跑了 `nuxt build`，没有实际 `node .output/server/index.mjs` 启动过产物。
- 没有验证 S3 上传、AVIF 压缩 worker 在生产构建下是否正常（Worker 格式 `vite.worker.format = 'es'`，AVIF 排除预打包）。
- 环境变量依赖较多（见 `nuxt.config.ts` 的 `runtimeConfig`），需确认部署时配置齐全。

---

## 待定决策（需用户拍板，可能需要改代码）

1. **删除按钮是否保留红色？** 当前保留（`destructive`）。若要纯黑白灰，改 `app/components/ui/IconButton.vue` 和 `DeleteConfirmModal.vue`、`ContextMenuItem` 的 destructive 变体。
2. **是否要加回极淡阴影？** 当前完全无阴影。若觉得"太平"、层次不够，可给 Card / Dialog / 浮层加回 `shadow-sm`。token 里没有定义阴影变量，直接用 Tailwind 的 `shadow-*` 即可。

---

## 快速命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 本地开发（端口 3000，自动打开）
pnpm build            # 生产构建
pnpm generate         # 静态生成（如需）
node .output/server/index.mjs   # 运行生产产物
```

## 关键文件索引

| 文件 | 作用 |
|---|---|
| `nuxt.config.ts` | Nuxt 配置；Tailwind 通过 `@tailwindcss/vite` 接入；含防 FOUC 主题脚本 |
| `app/assets/css/main.css` | Tailwind v4 入口 + shadcn token（黑白灰） |
| `app/lib/utils.ts` | `cn()` 类名合并 |
| `app/lib/variants.ts` | `buttonVariants`（cva） |
| `app/components/ui/` | 35 个 shadcn-vue 原语 |
| `app/composables/useAppToast.ts` | 全局 Toast store（配合 `app/components/ui/Toaster.vue`） |
| `components.json` | shadcn CLI 配置（framework: nuxt, style: new-york） |
| `app/components/file/file.vue` 对应逻辑 | 在 `app/pages/file.vue`（PhotoSwipe + 右键菜单 + 删除/重命名） |

---

**一句话总结给接手者**：代码已迁移到 shadcn-vue + reka-ui + Tailwind v4 黑白灰风格，`nuxt build` 通过并已推送；但**从未在浏览器实跑验证**，请务必 `pnpm dev` 走一遍上述冒烟清单，重点看 reka-ui 组件的受控交互和暗色模式。
