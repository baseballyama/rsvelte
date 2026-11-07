<script lang="ts">
  import { type Snippet } from 'svelte'
  import type { TypeViewProps } from '../types.js'
  import { getAllProperties } from '../util.js'
  // import { htmlState } from '../util/mutation-observer.svelte.js'
  import Expandable from './Expandable.svelte'
  import GetterSetter from './GetterSetter.svelte'
  import HtmlValue from './HTMLValue.svelte'
  import Node from './Node.svelte'
  import PropertyList from './PropertyList.svelte'

  type Props = TypeViewProps<HTMLElement> & { children?: Snippet }

  let { value, key = undefined, path, children, ...rest }: Props = $props()

  let keys = $derived(
    getAllProperties(value).filter(
      (prop) =>
        !['__svelte_meta', '__className', '__attributes', '__styles', '__t'].includes(
          prop.toString()
        )
    )
  )
</script>

<Expandable {...{ value, key, path }} length={keys.length} keepPreviewOnExpand={false} {...rest}>
  {#snippet valuePreview()}
    {#key value}
      <HtmlValue {value} />
    {/key}
  {/snippet}
  {#if children}
    {@render children()}
  {/if}
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
