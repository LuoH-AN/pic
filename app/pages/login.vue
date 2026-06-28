<template>
  <div class="flex min-h-screen items-center justify-center px-6 py-10">
    <div class="relative flex w-full max-w-[440px] flex-col gap-6 rounded-xl border bg-card p-7 pt-9 shadow-[0_18px_50px_var(--ring)] max-md:rounded-lg max-md:px-5 max-md:pt-7">
      <div class="flex flex-col items-center gap-2.5 text-center">
        <div
          class="mb-0.5 flex size-[60px] items-center justify-center rounded-2xl text-white shadow-[0_12px_30px_var(--ring)]"
          style="background: var(--primary-gradient)"
        >
          <Lock class="size-7" />
        </div>
        <h1 class="m-0 text-2xl font-bold tracking-tight text-foreground max-md:text-[21px]">
          访问验证
        </h1>
        <p class="m-0 text-[13.5px] text-muted-foreground">
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
          class="h-[46px]"
        />

        <p v-if="errorMessage" class="m-0 mt-0.5 text-[13px] text-destructive">
          {{ errorMessage }}
        </p>

        <UiButton
          type="submit"
          variant="gradient"
          size="lg"
          :disabled="loading"
          class="mt-1.5 h-[46px] w-full"
        >
          <Loader2 v-if="loading" class="size-[17px] animate-spin" />
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
