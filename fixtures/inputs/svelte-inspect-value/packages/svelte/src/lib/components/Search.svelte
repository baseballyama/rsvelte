<script lang="ts">
  import { getContext, onDestroy } from 'svelte'
  import type { SvelteHTMLElements } from 'svelte/elements'
  import * as icons from './icons/index.js'
  import { useOptions } from '../options.svelte.js'
  import { useState } from '../state.svelte.js'
  import { wait } from '../util.js'
  import { getAncestorPaths, searchStructuredIndex, type SearchIndex } from '../util/search.js'
  import Input from './Input.svelte'
  import NodeIconButton from './NodeIconButton.svelte'

  type Props = {
    query: string
    matchingPaths: string[]
  } & SvelteHTMLElements['input']

  let { query = $bindable(''), matchingPaths = $bindable([]), onkeydown, ...rest }: Props = $props()
  const collapseState = useState()

  const options = useOptions()
  const { searchMode: initialMode, search: searchKind } = $derived(options.value)
  let searchEle = $state<Input>()
  let prevQuery = $state<string>()
  // svelte-ignore state_referenced_locally
  let mode = $state<'and' | 'or'>(initialMode)
  const id = $props.id()

  $effect(() => {
    if (query.length === 0 || searchKind === false) {
      matchingPaths = []
    }
  })

  const buildIndex = getContext<(() => SearchIndex) | undefined>(Symbol.for('siv.build-index'))

  async function expandMatchingPaths() {
    for (const path of matchingPaths) {
      collapseState.setCollapse(path, { collapsed: false })
      await wait()
    }
  }

  export function searchWithQuery(queryText: string) {
    query = queryText
    search()
  }

  export function search() {
    if (query.length) {
      if (prevQuery === query && matchingPaths.length > 0 && matchingPaths.length > 0) {
        expandMatchingPaths()
        prevQuery = undefined
        return
      }
      prevQuery = query
      const sIndex = buildIndex?.()
      if (sIndex) {
        const hits = searchStructuredIndex(sIndex, query, mode)
        if (hits.length) {
          let precedingPaths = new Set<string>()
          hits.forEach((p) => {
            getAncestorPaths(p).forEach((path) => precedingPaths.add(path))
          })
          matchingPaths = [...precedingPaths, ...hits].sort((a, b) => a.length - b.length)
        } else {
          matchingPaths = []
        }
      }
    } else {
      matchingPaths = []
      prevQuery = undefined
    }
  }

  function onSearchKeyDown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    if (event.key === 'Enter') {
      search()
    } else if (event.key === 'Escape') {
      matchingPaths = []
      prevQuery = undefined
    }
    onkeydown?.(event)
  }

  export async function focus() {
    searchEle?.focus()
  }

  onDestroy(() => {
    matchingPaths = []
  })

  export function clearPrevQuery() {
    prevQuery = undefined
  }
</script>

<Input
  bind:this={searchEle}
  {id}
  type="search"
  transitionParams={{ axis: 'x' }}
  bind:value={query}
  onkeydown={onSearchKeyDown}
  placeholder={prevQuery ?? 'search'}
  style="padding-right: 0; font-size: 0.857em"
  {...rest}
>
  {#snippet icon()}
    {#if matchingPaths.length > 0}
      <NodeIconButton
        title="clear search"
        onclick={() => {
          query = ''
        }}
      >
        <icons.Close />
      </NodeIconButton>
    {/if}
    {#if query.split(' ').filter(Boolean).length > 1}
      <NodeIconButton
        data-testid="search-mode-btn"
        style="min-width: 1ch; overflow: hidden;"
        title={mode === 'and'
          ? 'AND — node must match all terms'
          : 'OR — node must match one of the terms'}
        onclick={() => {
          if (mode === 'and') {
            mode = 'or'
          } else {
            mode = 'and'
          }
        }}
      >
        <icons.AndOr {mode} />
      </NodeIconButton>
    {/if}
    <NodeIconButton onclick={search} disabled={query.length === 0}>
      <icons.Search />
    </NodeIconButton>
  {/snippet}
</Input>
