export function useAppToast() {
  const show = ref(false)
  const message = ref('')

  const showToast = (msg: string, duration = 2000) => {
    message.value = msg
    show.value = true
    setTimeout(() => {
      show.value = false
    }, duration)
  }

  return { show, message, showToast }
}
