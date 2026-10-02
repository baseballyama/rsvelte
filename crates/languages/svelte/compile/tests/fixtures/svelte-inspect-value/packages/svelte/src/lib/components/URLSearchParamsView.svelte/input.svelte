<script lang="ts">
  import type { TypeViewProps } from '../types.js'
  import Entry from './Entry.svelte'
  import Expandable from './Expandable.svelte'
  import Node from './Node.svelte'
  import Preview from './Preview.svelte'

  type Props = TypeViewProps<URLSearchParams>

  let { value = new URLSearchParams(), key = undefined, path, ...rest }: Props = $props()

  let entries = $derived.by(() => {
    let entries: Record<string, string | string[]> = {}

    for (const key of value.keys()) {
      if (!Object.hasOwn(entries, key)) {
        const all = value.getAll(key)
        if (all.length === 1) {
          entries[key] = all[0]
        } else {
          entries[key] = all
        }
      }
    }

    return Object.entries(entries)
  })

  let preview = $derived(entries.slice(0, 3))
</script>

<Expandable {...{ value, key, path }} length={value.size} {...rest}>
  {#snippet valuePreview({ showPreview })}
    <Preview keyValue={preview} prefix={'{'} postfix={'}'} {showPreview} />
  {/snippet}
  {#each entries as [key, value], i (key)}
    <Entry {i}>
      <Node {value} {key} {path} />
    </Entry>
  {/each}
</Expandable>
