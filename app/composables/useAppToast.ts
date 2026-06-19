// 全局单例 Toast。
// 计时器句柄用模块级变量保存，而不是放进 useState：useState 是 SSR 可序列化的共享状态，
// 不适合存放 setTimeout 句柄这类不可序列化对象。
let toastTimer: ReturnType<typeof setTimeout> | null = null

export function useAppToast() {
  const show = useState<boolean>('app-toast-show', () => false)
  const message = useState<string>('app-toast-message', () => '')

  const clearToastTimer = () => {
    if (toastTimer) {
      clearTimeout(toastTimer)
      toastTimer = null
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
    toastTimer = setTimeout(() => {
      show.value = false
      toastTimer = null
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
