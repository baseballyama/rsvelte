<script lang="ts">
  // eslint-disable @typescript-eslint/no-explicit-any
  import { getPreviewLevel, useSearchContext } from '../contexts.js'
  import { getContext, setContext, type Component } from 'svelte'
  import { useOptions, type InspectOptions } from '../options.svelte.js'
  import { InspectError, type TypeViewProps } from '../types.js'
  import { getType, stringifyPath, type ValueType } from '../util.js'
  import Default from './Default.svelte'
  import HtmlView from './HTMLView.svelte'
  import { getComponent, getDefaultComponent } from './index.js'
  import InspectErrorView from './InspectErrorView.svelte'

  type Props = TypeViewProps<unknown> & { usedefaults?: boolean; forceView?: string }

  let {
    value = undefined,
    key,
    keyDelim = ':',
    path: prevPath = [],
    usedefaults = false,
    forceView,
    ...rest
  }: Props = $props()

  const options = useOptions()
  const previewLevel = getPreviewLevel()
  let type: ValueType = $derived(forceView ? forceView : getType(value, options.value.stores))

  // FIXME: this is so messy
  function getTypeComponent(
    value: unknown,
    type: ValueType,
    useDefaults: boolean,
    options: InspectOptions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): [Component<TypeViewProps<any>>, Partial<TypeViewProps>] {
    let entry = getComponent(type, useDefaults ? {} : options.customComponents)

    if (entry) {
      let [component, propfn, predicate] = entry
      let props = propfn ? propfn({ value }) : {}
      if (predicate) {
        const use = predicate({ value, key, type, ...rest })
        if (!use) {
          const [component, propfn] = getDefaultComponent(type)
          const props = propfn ? propfn({ value }) : {}
          return [component, props]
        }
      }

      return [component, props] as const
    }

    try {
      if (value instanceof HTMLElement) {
        return [HtmlView, {}] as const
      }
    } catch {
      return [Default, {}] as const
    }

    return [Default, {}] as const
  }

  let [TypeComponent, componentProps] = $derived(
    getTypeComponent(value, type, usedefaults, options.value)
  )
  let path = $derived(key != null && prevPath ? [...prevPath, key] : ['root'])
  let stringifiedPath = $derived(stringifyPath(path))

  const searchResult = useSearchContext()
  const { matchingPaths } = $derived(searchResult())

  let match = $derived.by(() => {
    if (matchingPaths && matchingPaths.length) {
      return matchingPaths.findIndex((p) => p === stringifiedPath) > -1
    }

    return false
  })

  const _parentIsExact = getContext<(() => boolean) | undefined>(Symbol.for('siv.exact'))

  setContext(Symbol.for('siv.exact'), () => match)

  let visible = $derived.by(() => {
    if (previewLevel > 0) return true
    if (matchingPaths.length === 0) return true
    if (matchingPaths.length > 0) {
      const searchMode = options.value.search
      if (!searchMode) {
        return true
      }
      if (searchMode === true || searchMode === 'filter') {
        return _parentIsExact || match
      }
      if (searchMode === 'filter-strict') {
        return match
      }
    }

    return true
  })
</script>

{#if visible}
  <svelte:boundary
    onerror={(e) =>
      console.error(new Error(`Caught in Node.svelte. Key: ${String(key)}`, { cause: e }))}
  >
    <TypeComponent {value} {key} {keyDelim} {type} {path} {match} {...rest} {...componentProps} />

    {#snippet failed(error, reset)}
      {@const inspectError = new InspectError(`Component for value of type ${type} failed`, value, {
        cause: error,
      })}

      <InspectErrorView value={inspectError} {key} {path} {reset} />
    {/snippet}
  </svelte:boundary>
{/if}
