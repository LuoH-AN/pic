<template>
  <div class="flex min-h-screen items-center justify-center px-6 py-10">
    <div class="relative flex w-full max-w-[420px] flex-col gap-8 rounded-xl border bg-card p-8 max-md:rounded-lg max-md:p-6">
      <div class="flex flex-col items-center gap-3 text-center">
        <div
          class="flex size-12 items-center justify-center rounded-xl border bg-background text-foreground"
        >
          <Lock class="size-5" />
        </div>
        <h1 class="m-0 text-xl font-semibold tracking-tight text-foreground">
          访问验证
        </h1>
        <p class="m-0 text-sm text-muted-foreground">
          请输入访问密码以继续
        </p>
      </div>

      <form class="flex flex-col gap-3" @submit.prevent="submitLogin">
        <UiLabel for="access-password">访问密码</UiLabel>
        <UiInput
          id="access-password"
          v-model="password"
          type="password"
          placeholder="请输入访问密码"
          autocomplete="current-password"
          :disabled="loading"
          class="h-10"
        />

        <p v-if="errorMessage" class="m-0 mt-0.5 text-[13px] text-destructive">
          {{ errorMessage }}
        </p>

        <UiButton
          type="submit"
          variant="default"
          size="lg"
          :disabled="loading"
          class="mt-2 h-10 w-full"
        >
          <Loader2 v-if="loading" class="size-4 animate-spin" />
          <span>{{ loading ? '验证中...' : '进入系统' }}</span>
        </UiButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lock, Loader2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: '访问验证',
})

const route = useRoute()
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const { refreshSession, markAuthenticated } = useAccessAuth()

const redirectPath = computed(() => {
  const target = normalizeAccessRedirect(route.query.redirect)
  return target === '/login' ? '/' : target
})

const submitLogin = async () => {
  if (loading.value) return
  if (!password.value.trim()) {
    errorMessage.value = '请输入访问密码'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password: password.value },
    })
    markAuthenticated()
    await navigateTo(redirectPath.value, { replace: true })
  } catch {
    errorMessage.value = '访问密码错误，请重试'
  } finally {
    loading.value = false
  }
}

watch(password, () => {
  if (!errorMessage.value) return
  errorMessage.value = ''
})

onMounted(async () => {
  const session = await refreshSession()
  if (!session.enabled || session.authenticated) {
    await navigateTo(redirectPath.value, { replace: true })
  }
})
</script>
