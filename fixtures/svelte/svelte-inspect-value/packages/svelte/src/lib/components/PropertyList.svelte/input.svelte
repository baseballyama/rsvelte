<script lang="ts" generics="T, Key = T extends Map<infer K, unknown> ? K : (keyof T | PropertyKey)">
  import type { Snippet } from 'svelte'
  import { getPropertyDescriptor, type ValueType } from '../util.js'
  import Entry from './Entry.svelte'
  import GetterSetter from './GetterSetter.svelte'
  import Node from './Node.svelte'
  import NodeActionButton from './NodeActionButton.svelte'

  type PreviewProps = {
    value: T
    type?: ValueType
    keys?: Key[]
    path?: PropertyKey[]
    item?: Snippet<
      [
        {
          key: Key
          index: number
          descriptor?: PropertyDescriptor
        },
      ]
    >
  }

  let { value, keys = [], item, path }: PreviewProps = $props()

  const paging = 50
  let max = $state(paging)

  let slicedKeys = $derived(keys.length > max ? keys.slice(0, max) : keys)
</script>

{#each slicedKeys as key, index (key)}
  {@const descriptor = getPropertyDescriptor(value, key as PropertyKey)}
  <Entry i={index}>
    {#if item}
      {@render item({
        key,
        index,
        descriptor,
      })}
    {:else if descriptor?.get || descriptor?.set}
      <GetterSetter {value} {descriptor} key={key as keyof typeof value} {path} />
    {:else}
      <Node value={value?.[key as keyof typeof value]} key={key as keyof typeof value} {path} />
    {/if}
  </Entry>
{/each}
{#if slicedKeys.length < keys.length}
  <NodeActionButton
    style="margin-left: 2em; text-align: center; margin-bottom: 0.5em; width: calc(100% - 5em)"
    onclick={() => {
      max += paging
    }}>{Math.abs(max - keys.length)} more</NodeActionButton
  >
{/if}
