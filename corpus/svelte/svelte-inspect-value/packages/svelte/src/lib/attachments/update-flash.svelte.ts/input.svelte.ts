import equal from 'fast-deep-equal'
import type { Attachment } from 'svelte/attachments'

export type FlashFn = (flashStyle?: Partial<CSSStyleDeclaration>) => void

export const flash = <T extends Element = HTMLElement | SVGElement>(
  value: () => unknown,
  onupdate?: (node: T) => void,
  enabled: boolean = false,
  prevValue: unknown = undefined,
  initialized = false
): Attachment<T> => {
  return (node) => {
    $effect(() => {
      const newVal = value()
      if (enabled) {
        if (initialized) {
          if (!equal(newVal, prevValue)) {
            onupdate?.(node)
            node.dispatchEvent(new CustomEvent('inspectvaluechange', { bubbles: true }))
            prevValue = newVal
          }
        } else {
          initialized = true
          prevValue = newVal
        }
      } else {
        prevValue = newVal
      }
    })
  }
}

declare module 'svelte/elements' {
  interface HTMLAttributes<T extends EventTarget> extends AriaAttributes, DOMAttributes<T> {
    oninspectvaluechange?: () => void
  }
}
