<script lang="ts">
  import { getContext } from 'svelte'
  import type { TypeViewProps } from '../types.js'
  import Entry from './Entry.svelte'
  import Expandable from './Expandable.svelte'
  import Node from './Node.svelte'
  import StringValue from './StringValue.svelte'

  type Props = TypeViewProps<Error>

  let { value, key, type = 'error', path }: Props = $props()
  let useDefaults = getContext<boolean | undefined>(Symbol.for('siv.use-defaults'))

  let entries: [string, unknown][] = $derived(
    Object.entries({
      name: value.name,
      message: value.message,
      stack: value.stack,
      cause: value.cause,
    }).filter(([, v]) => v != null)
  )
</script>

<Expandable {value} {key} {type} {path} length={entries.length} keepPreviewOnExpand>
  {#snippet valuePreview()}
    <StringValue {type} value={value.toString()} />
  {/snippet}
  {#each entries as [key, value], i (key)}
    <Entry {i}>
      <Node {value} {key} {path} usedefaults={useDefaults ?? false} />
    </Entry>
  {/each}
</Expandable>
