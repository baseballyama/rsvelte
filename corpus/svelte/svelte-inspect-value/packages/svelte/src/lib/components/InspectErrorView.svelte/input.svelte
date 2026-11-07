<script lang="ts">
  import { getContext, setContext } from 'svelte'
  import { InspectError, type TypeViewProps } from '../types.js'
  import Expandable from './Expandable.svelte'
  import GetterSetter from './GetterSetter.svelte'
  import Node from './Node.svelte'
  import NodeActionButton from './NodeActionButton.svelte'
  import PropertyList from './PropertyList.svelte'
  import StringValue from './StringValue.svelte'

  type Props = TypeViewProps<InspectError, 'InspectError'> & { reset: () => void }

  let {
    value = new InspectError(''),
    key,
    type = 'InspectError',
    path,
    keyPrefix,
    reset,
  }: Props = $props()

  setContext(Symbol.for('siv.use-defaults'), true)
  const depth = getContext<number | undefined>(Symbol.for('siv.error-depth')) ?? 0
  setContext(Symbol.for('siv.error-depth'), depth + 1)
</script>

{#if depth <= 3}
  <Expandable
    {value}
    {key}
    {keyPrefix}
    {path}
    {type}
    length={4}
    showLength={false}
    keepPreviewOnExpand
  >
    {#snippet valuePreview()}
      <NodeActionButton onclick={reset}>RESET</NodeActionButton>
      <StringValue type="error" value={value.message} />
    {/snippet}
    <PropertyList {value} keys={['message', 'value', 'cause', 'stack']}>
      {#snippet item({ key, descriptor })}
        {#if descriptor?.get || descriptor?.set}
          <GetterSetter {value} {descriptor} {key} {path} usedefaults />
        {:else}
          <Node value={value[key as keyof typeof value]} {key} {path} usedefaults />
        {/if}
      {/snippet}
    </PropertyList>
  </Expandable>
{:else}
  max error depth exceeded
{/if}
