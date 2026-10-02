<script lang="ts">
  import type { TypeViewProps } from '../types.js'
  import Entry from './Entry.svelte'
  import Expandable from './Expandable.svelte'
  import Node from './Node.svelte'
  import StringValue from './StringValue.svelte'

  type Props = TypeViewProps<URL>

  let { value = new URL(''), key, type, path, ...rest }: Props = $props()

  let {
    hash,
    host,
    hostname,
    href,
    origin,
    searchParams,
    password,
    pathname,
    port,
    protocol,
    username,
  } = $derived(value)

  let entries = $derived(
    Object.entries({
      protocol,
      username,
      password,
      host,
      port,
      pathname,
      hash,
      hostname,
      origin,
      href,
      searchParams,
    }).filter((prop) => !!prop[1].toString())
  )
</script>

<Expandable {...{ value, key, type, path }} length={entries.length} showLength={false} {...rest}>
  {#snippet valuePreview()}
    <StringValue {type} value={value.toString()} />
  {/snippet}
  {#each entries as [key, value], i (key)}
    <Entry {i}>
      <Node {value} {key} {path} />
    </Entry>
  {/each}
</Expandable>
