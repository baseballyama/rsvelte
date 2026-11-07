<script lang="ts">
  import type { TypeViewProps } from '../types.js'
  import Expandable from './Expandable.svelte'
  import Node from './Node.svelte'
  import Preview from './Preview.svelte'
  import PropertyList from './PropertyList.svelte'

  type Props = TypeViewProps<Set<unknown>>

  let { value, key, type, path, ...rest }: Props = $props()

  let entries = $derived([...value.entries()].map(([_, v]) => v))
  let keys = $derived([...entries.keys()])
</script>

<Expandable {...{ value, key, type, path }} length={entries.length} {...rest}>
  {#snippet valuePreview({ showPreview })}
    <Preview list={entries} prefix={'{'} postfix={'}'} showKey={false} {showPreview} />
  {/snippet}
  <PropertyList {value} {keys}>
    {#snippet item({ key, index })}
      <Node {path} key={index} value={entries[key]} />
    {/snippet}
  </PropertyList>
</Expandable>
