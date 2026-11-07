import { onMount } from 'svelte'

export function htmlState<T extends HTMLElement = HTMLElement>(ele: T) {
  let element: T = $state(ele)
  let lastMutation = $state<MutationRecord>()

  const observer = new MutationObserver(([mutation]) => {
    // reset element reference to trigger reactivity
    element = null as unknown as T
    element = mutation.target as T
    lastMutation = mutation
  })

  onMount(() => {
    observer.observe(ele, {
      attributes: true,
      childList: true,
      attributeOldValue: true,
      characterData: true,
    })
    return () => {
      observer.disconnect()
    }
  })

  return {
    get ele() {
      return element
    },
    get lastMutation() {
      return lastMutation
    },
    destroy: () => {
      observer.disconnect()
    },
  }
}
