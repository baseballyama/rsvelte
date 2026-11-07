<script lang="ts">
  import type { TypeViewProps } from '../types.js'
  import { type ValueType, enumerateObject } from '../util.js'
  import Expandable from './Expandable.svelte'
  import GetterSetter from './GetterSetter.svelte'
  import Node from './Node.svelte'
  import Preview from './Preview.svelte'
  import PropertyList from './PropertyList.svelte'

  type Props = TypeViewProps<object>

  let { value, key = undefined, type, path, ...rest }: Props = $props()

  let namedConstructor = $derived(
    value?.constructor?.name !== 'Object' ? value?.constructor?.name : false
  )

  let objectType = $derived(namedConstructor ? (namedConstructor as ValueType) : type)
  let properties = $derived(enumerateObject(value) as (symbol | string)[])
  let keys = $derived(
    [...properties, namedConstructor ? 'constructor' : undefined].filter((v) => v != null)
  )
</script>

<Expandable
  type={objectType}
  length={keys.length}
  {key}
  {path}
  {value}
  forceType={!!namedConstructor}
  {...rest}
>
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
  <PropertyList {keys} {value} {type}>
    {#snippet item({ key, descriptor })}
      {#if descriptor?.get || descriptor?.set}
        <GetterSetter {value} {descriptor} {key} {path} />
      {:else}
        <Node value={value?.[key as keyof typeof value]} {key} {path} />
      {/if}
    {/snippet}
  </PropertyList>
</Expandable>
