import { setContext } from 'svelte'
import type { InspectOptions } from 'svelte-inspect-value'
import _Inspect, { DEFAULT_OPTIONS, GLOBAL_OPTIONS_CONTEXT } from 'svelte-inspect-value'

export const globalOpts = $state(DEFAULT_OPTIONS)

export const panelState = $state<{ keepOpen: boolean; ele?: HTMLDivElement }>({
  keepOpen: false,
  ele: undefined,
})

export function setGlobalOpts(opts: Partial<InspectOptions>) {
  Object.keys(DEFAULT_OPTIONS).forEach((k) => {
    const key = k as unknown as keyof InspectOptions
    //@ts-expect-error asdf
    globalOpts[key] = opts[key]
  })
}

export const Inspect = ((...args: any[]) => {
  if (typeof args[1] === 'object') {
    if (typeof args[1]['class'] === 'undefined') {
      args[1]['class'] = 'not-content mt'
    } else if (typeof args[1]['class'] === 'string') {
      args[1]['class'] += ' not-content mt'
    }
  }
  setContext(GLOBAL_OPTIONS_CONTEXT, globalOpts)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (_Inspect as any)(...args)
}) as unknown as typeof _Inspect

export const Values = ((...args: any[]) => {
  setContext(GLOBAL_OPTIONS_CONTEXT, globalOpts)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    _Inspect.Values.withOptions(() => ({ elementAttributes: { class: 'mt not-content' } })) as any
  )(...args)
}) as typeof _Inspect.Values

export const Panel = ((...args: any[]) => {
  setContext(GLOBAL_OPTIONS_CONTEXT, globalOpts)
  if (typeof args[1] === 'object') {
    if (typeof args[1]['class'] === 'undefined') {
      args[1]['class'] = ' not-content'
    } else if (typeof args[1]['class'] === 'string') {
      args[1]['class'] += 'not-content'
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (_Inspect.Panel as any)(...args)
}) as typeof _Inspect.Panel
