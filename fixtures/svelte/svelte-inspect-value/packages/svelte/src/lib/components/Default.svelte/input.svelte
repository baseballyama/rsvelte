<script lang="ts">
  import type { TypeViewProps } from '../types.js'
  import { getAllProperties } from '../util.js'
  import Expandable from './Expandable.svelte'
  import GetterSetter from './GetterSetter.svelte'
  import Node from './Node.svelte'
  import OneLineView from './OneLineView.svelte'
  import Preview from './Preview.svelte'
  import PropertyList from './PropertyList.svelte'

  type Props = TypeViewProps<object>

  let { value, key, path, ...rest }: Props = $props()

  let keys = $derived(getAllProperties(value))
</script>

{#if keys.length}
  <Expandable length={keys.length} {key} {path} {value} {...rest}>
    {#snippet valuePreview({ showPreview })}
      <Preview
        prefix={'{'}
        postfix={'}'}
        value={value as Record<string | symbol, unknown>}
        {path}
        {keys}
        {showPreview}
      />
    {/snippet}
    <PropertyList {keys} {value}>
      {#snippet item({ key, descriptor })}
        {#if descriptor?.get || descriptor?.set}
          <GetterSetter {value} {descriptor} {key} {path} />
        {:else}
          <Node value={value[key as keyof typeof value]} {key} {path} />
        {/if}
      {/snippet}
    </PropertyList>
  </Expandable>
{:else}
  <OneLineView {key} {path} {value} {...rest}></OneLineView>
{/if}
