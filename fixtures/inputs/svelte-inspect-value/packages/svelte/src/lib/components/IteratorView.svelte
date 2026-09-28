<script lang="ts">
  import { onMount } from 'svelte'
  import { getPreviewLevel, useValueCache } from '../contexts.js'
  import type { TypeViewProps } from '../types.js'
  import { stringifyPath } from '../util.js'
  import Expandable from './Expandable.svelte'
  import Node from './Node.svelte'
  import NodeActionButton from './NodeActionButton.svelte'
  import Preview from './Preview.svelte'
  import PropertyList from './PropertyList.svelte'
  import { nodeActionKeydown } from '../util.js'

  type Props = TypeViewProps<
    Iterator<unknown> | AsyncIterator<unknown> | Generator | AsyncGenerator
  >

  let { value: iterator, key = undefined, type, path = [], showKey, ...rest }: Props = $props()

  const valueCache = useValueCache<{ done: boolean; unwrap: unknown[] } | undefined>()
  const previewLevel = getPreviewLevel()
  let stringifiedPath = $derived(stringifyPath(path))
  let hasCached = $derived(valueCache.has(stringifiedPath))
  let unwrap = $state<unknown[]>([])
  let busy = $state(false)
  let isDone = $state<boolean | undefined>(false)

  onMount(() => {
    if (hasCached) {
      const cachedValue = valueCache.get(stringifiedPath)
      if (cachedValue) {
        unwrap = cachedValue.unwrap
        isDone = cachedValue.done
      }
    }
  })

  async function next(e: UIEvent) {
    e.stopPropagation()
    busy = true
    const { value, done } = await iterator.next()
    busy = false
    if (typeof done === 'boolean') isDone = done
    if (!done) {
      unwrap.push(value)
    }
    valueCache.set(stringifiedPath, { unwrap: $state.snapshot(unwrap), done: isDone as boolean })
  }

  async function complete(e: UIEvent) {
    e.stopPropagation()
    busy = true
    let result = await iterator.next()
    let i = 0
    while (!result.done && i < 100) {
      i++
      unwrap.push(result.value)
      result = await iterator.next()
      if (typeof result.done === 'boolean') isDone = result.done
    }
    busy = false
    valueCache.set(stringifiedPath, { unwrap: $state.snapshot(unwrap), done: isDone as boolean })
  }
</script>

<Expandable
  {...{ value: iterator, key, type, path }}
  length={unwrap.length}
  {showKey}
  showLength={false}
  {...rest}
>
  {#snippet valuePreview({ showPreview })}
    {#if !previewLevel}
      <NodeActionButton {busy} disabled={isDone} onclick={next} onkeydown={nodeActionKeydown(next)}>
        {isDone ? 'done' : 'next'}
      </NodeActionButton>
      {#if !isDone}
        <NodeActionButton
          {busy}
          disabled={isDone}
          onclick={complete}
          onkeydown={nodeActionKeydown(complete)}
        >
          100
        </NodeActionButton>
      {/if}
    {/if}
    <Preview {path} list={unwrap} prefix={'['} postfix={']'} {showPreview} showKey={false} />
  {/snippet}
  <PropertyList value={unwrap} keys={[...unwrap.keys()]}>
    {#snippet item({ key })}
      <Node {key} {path} value={unwrap[key]} />
    {/snippet}
  </PropertyList>
</Expandable>
