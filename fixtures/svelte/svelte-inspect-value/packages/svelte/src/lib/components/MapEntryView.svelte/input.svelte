<script lang="ts">
  import type { TypeViewProps } from '../types.js'
  import Entry from './Entry.svelte'
  import Expandable from './Expandable.svelte'
  import Node from './Node.svelte'
  import Preview from './Preview.svelte'

  type MapEntry = [unknown, unknown]

  type Props = TypeViewProps<MapEntry>

  let { value, key = undefined, type, path = [], ...rest }: Props = $props()
</script>

<Expandable
  {key}
  type=""
  {value}
  {path}
  length={2}
  showLength={false}
  keepPreviewOnExpand
  {...rest}
>
  {#snippet valuePreview({ showPreview })}
    <Preview
      keyValue={[[value[0] as PropertyKey, value[1]]]}
      prefix={'{'}
      postfix={'}'}
      keyDelim="=>"
      keyStyle="margin-right: 0.5em;"
      {showPreview}
    />
  {/snippet}

  <Entry i={0}>
    <Node key="key" value={value[0]} {path} />
  </Entry>
  <Entry i={1}>
    <Node key="value" value={value[1]} {path} />
  </Entry>
</Expandable>
