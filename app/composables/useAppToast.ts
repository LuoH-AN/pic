// Global toast store powering the reka-ui based <Toaster />.
//
// Toasts live in a useState list (SSR-serializable). Each record carries its
// own duration; the <ToastRoot> auto-dismisses and emits update:open=false,
// which the Toaster uses to remove the record (after the exit animation).
// IDs are a module-level counter — fine because toasts are only ever created
// from client-side interactions, never during SSR, so there is no hydration
// mismatch.

interface AppToast {
  id: number
  message: string
  duration: number
}

let seq = 0

const INFINITE = Number.POSITIVE_INFINITY

export function useAppToast() {
  const toasts = useState<AppToast[]>('app-toasts', () => [])

  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter(item => item.id !== id)
  }

  const push = (message: string, duration: number) => {
    const id = (seq += 1)
    toasts.value = [...toasts.value, { id, message, duration }]
    return id
  }

  const showToast = (message: string, duration = 2000) => {
    push(message, duration)
  }

  const showLoadingToast = (message: string) => {
    push(message, INFINITE)
  }

  const hideToast = () => {
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    showLoadingToast,
    hideToast,
    dismiss,
  }
}
