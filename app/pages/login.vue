<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>访问验证</h1>
        <p>请输入访问密码后继续使用图片上传与管理功能。</p>
      </div>

      <form class="login-form" @submit.prevent="submitLogin">
        <label for="access-password" class="form-label">访问密码</label>
        <input
          id="access-password"
          v-model="password"
          class="password-input"
          type="password"
          placeholder="请输入访问密码"
          autocomplete="current-password"
          :disabled="loading"
        >

        <p v-if="errorMessage" class="error-tip">{{ errorMessage }}</p>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '验证中...' : '进入系统' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-10) var(--space-6);
  background: var(--color-page-bg);
}

.login-card {
  width: 100%;
  max-width: 460px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: var(--shadow-soft);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.login-header h1 {
  margin: 0;
  font-size: 24px;
  color: var(--color-text-primary);
}

.login-header p {
  margin: 10px 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.password-input {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: 0 12px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.password-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-ring);
}

.password-input::placeholder {
  color: var(--color-text-muted);
}

.password-input:disabled {
  background: var(--color-surface-alt);
  cursor: not-allowed;
}

.submit-btn {
  margin-top: 4px;
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--color-primary);
  border-radius: 12px;
  background: var(--color-primary);
  color: var(--color-toast-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-primary-strong);
  border-color: var(--color-primary-strong);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-tip {
  margin: 2px 0 0;
  color: var(--color-danger);
  font-size: 13px;
}

@media (max-width: 768px) {
  .login-page {
    padding: var(--space-6) var(--space-4);
  }

  .login-card {
    padding: 20px;
    border-radius: 12px;
  }

  .login-header h1 {
    font-size: 21px;
  }
}
</style>
