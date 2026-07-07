<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-card__head">
        <div class="login-card__badge">
          <Lock />
        </div>
        <h1 class="login-card__title">
          访问验证
        </h1>
        <p class="login-card__subtitle">
          请输入访问密码以继续
        </p>
      </div>

      <form class="login-form" @submit.prevent="submitLogin">
        <UiLabel for="access-password">访问密码</UiLabel>
        <UiInput
          id="access-password"
          v-model="password"
          type="password"
          placeholder="请输入访问密码"
          autocomplete="current-password"
          :disabled="loading"
          class="login-form__input"
        />

        <p v-if="errorMessage" class="login-form__error">
          {{ errorMessage }}
        </p>

        <UiButton
          type="submit"
          variant="default"
          size="lg"
          :disabled="loading"
          class="login-form__submit"
        >
          <Loader2 v-if="loading" class="spin" />
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

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2.5rem 1.5rem;
}

.login-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 26.25rem;
  padding: 2rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
}
@media (max-width: 767px) {
  .login-card {
    border-radius: var(--radius-lg);
    padding: 1.5rem;
  }
}

.login-card__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.login-card__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  color: var(--foreground);
}
.login-card__badge svg {
  width: 1.25rem;
  height: 1.25rem;
}

.login-card__title {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  letter-spacing: -0.01em;
  color: var(--foreground);
}

.login-card__subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--muted-foreground);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* UiInput / UiButton are child components; their root element receives
   this scope id, so these classes reach them without :deep. */
.login-form__input {
  height: var(--control-h-lg);
}

.login-form__error {
  margin: 0.125rem 0 0;
  font-size: 13px;
  color: var(--destructive);
}

.login-form__submit {
  margin-top: 0.5rem;
  width: 100%;
}
</style>
