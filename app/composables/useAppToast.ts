export function useAppToast() {
  const show = useState<boolean>('app-toast-show', () => false)
  const message = useState<string>('app-toast-message', () => '')
  const timer = useState<ReturnType<typeof setTimeout> | null>('app-toast-timer', () => null)

  const clearToastTimer = () => {
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
  }

  const hideToast = () => {
    clearToastTimer()
    show.value = false
  }

  const showToast = (msg: string, duration = 2000) => {
    clearToastTimer()
    message.value = msg
    show.value = true
    timer.value = setTimeout(() => {
      show.value = false
      timer.value = null
    }, duration)
  }

  const showLoadingToast = (msg: string) => {
    clearToastTimer()
    message.value = msg
    show.value = true
  }

  return {
    show,
    message,
    showToast,
    showLoadingToast,
    hideToast,
  }
}
