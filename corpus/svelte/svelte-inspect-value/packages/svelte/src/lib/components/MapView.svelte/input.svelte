<script lang="ts">
  import type { TypeViewProps } from '../types.js'
  import Expandable from './Expandable.svelte'
  import Node from './Node.svelte'
  import Preview from './Preview.svelte'
  import PropertyList from './PropertyList.svelte'

  type Props = TypeViewProps<Map<unknown, unknown>>

  let { value, key, type, path = [], ...rest }: Props = $props()

  let keys = $derived([...value.keys()])
  let entries = $derived<[PropertyKey, unknown][]>([...value.entries()] as [PropertyKey, unknown][])
</script>

<Expandable {value} {key} {type} {path} length={entries.length} {...rest}>
  {#snippet valuePreview({ showPreview })}
    <Preview
      keyValue={entries}
      prefix={'{'}
      postfix={'}'}
      keyDelim="=>"
      keyStyle="margin-right: 0.5em;"
      {showPreview}
    />
  {/snippet}
  <PropertyList {value} {keys}>
    {#snippet item({ key, index })}
      <Node forceView="mapentry" {path} key={index} value={[key, value.get(key)]} />
    {/snippet}
  </PropertyList>
</Expandable>
