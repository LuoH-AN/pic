export default defineNuxtRouteMiddleware(async (to) => {
  const { state, refreshSession } = useAccessAuth()

  const session = (import.meta.server || !state.value.checked)
    ? await refreshSession()
    : {
        enabled: state.value.enabled,
        authenticated: state.value.authenticated,
      }

  if (!session.enabled) {
    if (to.path === '/login') {
      return navigateTo('/')
    }
    return
  }

  if (to.path === '/login') {
    if (session.authenticated) {
      const redirect = normalizeAccessRedirect(to.query.redirect)
      return navigateTo(redirect === '/login' ? '/' : redirect)
    }
    return
  }

  if (!session.authenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }
})
