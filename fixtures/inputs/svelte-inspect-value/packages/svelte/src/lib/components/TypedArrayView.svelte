<script lang="ts">
  import type { List, TypeViewProps } from '../types.js'
  import Entry from './Entry.svelte'
  import Expandable from './Expandable.svelte'
  import Node from './Node.svelte'
  import Preview from './Preview.svelte'

  type Props = TypeViewProps<List>

  let { value, key = undefined, type, path, ...rest }: Props = $props()

  const internalKeys = ['buffer', 'byteLength', 'byteOffset', 'length']

  function getValue(key: keyof typeof value) {
    return value[key]
  }

  let entries = $derived<[string, unknown][]>(
    internalKeys.map((k) => [k, getValue(k as keyof typeof value)])
  )
  let preview = $derived(value.slice(0, 3))
</script>

<Expandable {...{ value, key, type, path }} length={value.length} {...rest}>
  {#snippet valuePreview({ showPreview })}
    <Preview prefix="[" postfix="]" list={preview} showKey={false} {showPreview} />
  {/snippet}
  {#each value as num, i (i)}
    <Entry {i}>
      <Node key={i} value={num} {path} />
    </Entry>
  {/each}
  {#each entries as [key, val], i (key)}
    <Entry i={value.length + i}>
      <Node {key} value={val} {path} />
    </Entry>
  {/each}
</Expandable>
