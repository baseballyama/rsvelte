export function intervalEffect(handler: TimerHandler, timeout: number) {
  let interval: number | undefined
  $effect(() => {
    interval = window.setInterval(handler, timeout)

    return () => {
      window.clearInterval(interval)
    }
  })
}
