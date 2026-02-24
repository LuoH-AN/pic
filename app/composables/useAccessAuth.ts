interface AccessSession {
  enabled: boolean
  authenticated: boolean
}

interface AccessAuthState extends AccessSession {
  checked: boolean
}

const defaultAuthState = (): AccessAuthState => ({
  enabled: true,
  authenticated: false,
  checked: false,
})

export function normalizeAccessRedirect(path: unknown) {
  if (typeof path !== 'string') return '/'
  const value = path.trim()
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'
  if (value.startsWith('/api/')) return '/'
  return value
}

export function useAccessAuth() {
  const state = useState<AccessAuthState>('access-auth-state', defaultAuthState)

  const applySession = (session: AccessSession) => {
    state.value = {
      enabled: Boolean(session.enabled),
      authenticated: Boolean(session.authenticated),
      checked: true,
    }
  }

  const refreshSession = async () => {
    try {
      const session = await $fetch<AccessSession>('/api/auth/session', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      applySession(session)
      return session
    } catch {
      const fallback = { enabled: true, authenticated: false }
      applySession(fallback)
      return fallback
    }
  }

  const markAuthenticated = () => {
    applySession({ enabled: true, authenticated: true })
  }

  const markLoggedOut = () => {
    applySession({ enabled: true, authenticated: false })
  }

  return {
    state,
    refreshSession,
    markAuthenticated,
    markLoggedOut,
  }
}
