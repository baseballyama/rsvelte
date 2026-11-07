<script lang="ts">
  import { getContext } from 'svelte'
  import CollapseStateProvider from './CollapseStateProvider.svelte'
  import Wrapper from './Wrapper.svelte'
  import PropertyList from './components/PropertyList.svelte'
  import { logToConsole } from './hello.svelte.js'
  import { createOptions, getGlobalInspectOptions, mergeOptions } from './options.svelte.js'
  import type { InspectValuesOptions } from './types.js'
  import { initialize } from './util.js'
  import type { Attachment } from 'svelte/attachments'

  let props: Record<PropertyKey, unknown> = $props()
  let valueKeys = $derived.by(() => {
    const allKeys = Object.keys(props)

    const symbolKeys = Object.getOwnPropertySymbols(props).filter(
      (s) => s.description !== '@attach'
    )

    return [...allKeys, ...symbolKeys]
  })
  let attachments = $derived.by(() => {
    const out: Record<symbol, Attachment> = {}
    const attachmentSymbols = Object.getOwnPropertySymbols(props)

    attachmentSymbols.forEach((s) => {
      if (s.description === '@attach') out[s] = props[s] as Attachment
    })

    return out
  })

  let withOptionsContext = getContext<InspectValuesOptions | undefined>(
    Symbol.for('siv.with-options')
  )
  let withOptions = $derived.by(() => {
    if (typeof withOptionsContext === 'function') {
      return withOptionsContext()
    }
    return {}
  })

  let globalOptions = getGlobalInspectOptions()
  let mergedOptions = $derived(
    mergeOptions(withOptions, typeof globalOptions === 'function' ? globalOptions() : globalOptions)
  )

  const options = createOptions(() => mergedOptions)

  let { theme, noanimate, borderless, onCollapseChange, onLog, heading } = $derived(options.value)
  let { elementAttributes = {} } = $derived(withOptions)
  let { class: classValue, ...attrs } = $derived(elementAttributes)

  let shouldRender = $derived(
    typeof options.value.renderIf === 'function'
      ? Boolean(options.value.renderIf())
      : Boolean(options.value.renderIf)
  )

  function log() {
    if (onLog) {
      onLog(props, 'props', ['Inspect.Values#props'])
    } else {
      logToConsole(['Inspect.Values#props'], props, 'props')
    }
  }

  initialize(options)
</script>

{#if shouldRender}
  <CollapseStateProvider {onCollapseChange} values={props} keys={valueKeys} name="">
    <Wrapper
      data-testid="inspect"
      class={[theme, noanimate && 'noanimate', borderless && 'borderless', classValue]}
      showExpandCollapse
      onlog={log}
      {heading}
      {...attrs}
      {...attachments}
    >
      {#if valueKeys.length}
        <PropertyList value={props} keys={valueKeys} />
      {:else}
        <div style="color: var(--_comment-color); text-align: center">no value</div>
      {/if}
    </Wrapper>
  </CollapseStateProvider>
{/if}
