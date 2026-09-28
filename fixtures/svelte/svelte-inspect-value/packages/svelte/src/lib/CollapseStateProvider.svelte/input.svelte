<!--
@component CollapseStateProvider

Initializes collapse state and provides function for building search index
-->
<script lang="ts">
  import { setContext, type Snippet } from 'svelte'
  import { useOptions, type InspectOptions } from './options.svelte.js'
  import { createState, STATE_CONTEXT_KEY } from './state.svelte.js'
  import type { BaseProps } from './types.js'
  import { build_search_index } from './util/search.js'

  type Props = {
    children: Snippet
    onCollapseChange: InspectOptions['onCollapseChange']
    keys?: PropertyKey[]
  } & BaseProps

  const { children, onCollapseChange, value, values, name, keys = [] }: Props = $props()
  const initState = $state({})
  const inspectState = createState(initState, (state) => onCollapseChange?.(state))
  const options = useOptions()

  setContext(STATE_CONTEXT_KEY, inspectState)

  setContext(Symbol.for('siv.build-index'), () =>
    build_search_index({
      value: keys.length ? values : value,
      key: keys.length ? '' : name,
      maxDepth: 20,
      options: options.value,
    })
  )
</script>

{@render children()}
