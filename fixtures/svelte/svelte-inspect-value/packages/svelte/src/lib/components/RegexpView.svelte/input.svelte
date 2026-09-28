<script lang="ts">
  import type { TypeViewProps } from '../types.js'
  import Expandable from './Expandable.svelte'
  import GetterSetter from './GetterSetter.svelte'
  import Highlight from './Highlight.svelte'
  import Node from './Node.svelte'
  import PropertyList from './PropertyList.svelte'

  type Props = TypeViewProps<RegExp>

  let { value, key = undefined, type, path, ...rest }: Props = $props()

  let keys = [
    'lastIndex',
    'dotAll',
    'flags',
    'global',
    'hasIndices',
    'ignoreCase',
    'multiline',
    'source',
    'sticky',
    'unicode',
    'unicodeSets',
  ]
</script>

<Expandable length={1} showLength={false} {type} {key} {path} {value} {...rest} keepPreviewOnExpand>
  {#snippet valuePreview()}
    <Highlight
      data-testid="value"
      class="value regexp"
      title={value.toString()}
      value={value.toString()}
      fields={['value']}
    />
  {/snippet}
  <PropertyList {keys} {value} {type}>
    {#snippet item({ key, descriptor })}
      {#if descriptor?.get || descriptor?.set}
        <GetterSetter {value} {descriptor} {key} {path} />
      {:else}
        <Node value={value[key as keyof typeof value]} {key} {path} />
      {/if}
    {/snippet}
  </PropertyList>
</Expandable>
