<script lang="ts">
  import type { SvelteHTMLElements } from 'svelte/elements'
  import CollapseStateProvider from './CollapseStateProvider.svelte'
  import Node from './components/Node.svelte'
  import PropertyList from './components/PropertyList.svelte'
  import { logToConsole } from './hello.svelte.js'
  import { createOptions, getGlobalInspectOptions, mergeOptions } from './options.svelte.js'
  import { type InspectProps } from './types.js'
  import { getAllProperties, getType, initialize, sortProps } from './util.js'
  import Wrapper from './Wrapper.svelte'

  let {
    value,
    values,
    name,
    class: classValue,
    ...props
  }: InspectProps & SvelteHTMLElements['div'] = $props()

  let [optionsProps, restProps] = $derived(sortProps(props))
  let wrapper = $state<Wrapper>()

  const globalOptions = getGlobalInspectOptions()
  let mergedOptions = $derived(
    mergeOptions(
      optionsProps,
      typeof globalOptions === 'function' ? globalOptions() : globalOptions
    )
  )

  let options = createOptions(() => mergedOptions)

  let { theme, noanimate, borderless, onCollapseChange, onLog, heading } = $derived(options.value)

  let shouldRender = $derived(
    typeof options.value.renderIf === 'function'
      ? Boolean(options.value.renderIf())
      : Boolean(options.value.renderIf)
  )

  export function search(query: string) {
    wrapper?.searchWithQuery(query)
  }

  let keys = $derived.by(() => {
    if (values) {
      if (Array.isArray(values)) {
        return [
          ...values.keys(),
          ...getAllProperties(values).filter((prop) => {
            if (typeof prop === 'string') {
              return /\d+/.test(prop) === false && prop !== 'length'
            }
            return true
          }),
        ]
      }

      return getAllProperties(values)
    }
    return []
  })

  function log() {
    if (onLog) {
      onLog(values, getType(values), ['Inspect#values'])
    } else {
      logToConsole(['Inspect#values'], values, getType(values))
    }
  }

  initialize(options)
</script>

{#if shouldRender}
  <CollapseStateProvider {onCollapseChange} {value} {values} {name} {keys}>
    <Wrapper
      data-testid="inspect"
      bind:this={wrapper}
      class={[classValue, theme, noanimate && 'noanimate', borderless && 'borderless']}
      showExpandCollapse={values != null}
      onlog={log}
      {heading}
      {...restProps}
    >
      {#if values && keys.length}
        <PropertyList value={values} {keys} />
      {:else if name || value}
        <Node {value} key={name} />
      {:else}
        <div style="color: var(--_comment-color); text-align: center">no value</div>
      {/if}
    </Wrapper>
  </CollapseStateProvider>
{/if}
