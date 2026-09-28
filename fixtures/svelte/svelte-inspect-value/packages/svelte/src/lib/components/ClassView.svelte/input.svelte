<script lang="ts">
  import { getPreviewLevel } from '../contexts.js'
  import type { TypeViewProps } from '../types.js'
  import { getAllProperties } from '../util.js'
  import Expandable from './Expandable.svelte'
  import GetterSetter from './GetterSetter.svelte'
  import Node from './Node.svelte'
  import Preview from './Preview.svelte'
  import PropertyList from './PropertyList.svelte'

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  type Props = TypeViewProps<Function>

  let { value, key, type, path, ...rest }: Props = $props()

  const previewLevel = getPreviewLevel()

  const nonStatic = ['name', 'length', 'prototype'] as PropertyKey[]

  let keys = $derived(getAllProperties(value))
</script>

<Expandable {...{ value, key, type, path }} length={keys.length} {...rest}>
  {#snippet valuePreview({ showPreview })}
    <span class="value {type}">
      {value.name}
    </span>
    {#if !previewLevel}
      <Preview
        prefix={'{'}
        postfix={'}'}
        {keys}
        value={value as unknown as Record<string | symbol, unknown>}
        {showPreview}
      />
    {/if}
  {/snippet}
  <PropertyList {keys} {value}>
    {#snippet item({ key, descriptor })}
      {#if descriptor?.get || descriptor?.set}
        <GetterSetter
          keyPrefix={nonStatic.includes(key) ? '' : 'static'}
          {key}
          {value}
          {descriptor}
          {path}
        />
      {:else}
        <Node
          keyPrefix={nonStatic.includes(key) ? '' : 'static'}
          {key}
          value={value[key as keyof typeof value]}
          {path}
        />
      {/if}
    {/snippet}
  </PropertyList>
</Expandable>
