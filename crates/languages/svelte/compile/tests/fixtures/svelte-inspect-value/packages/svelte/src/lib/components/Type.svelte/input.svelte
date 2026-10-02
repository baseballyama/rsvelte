<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { getPreviewLevel } from '../contexts.js'
  import { useOptions } from '../options.svelte.js'
  import type { ValueType } from '../util.js'
  import Highlight from './Highlight.svelte'

  type Props = {
    type?: ValueType | 'noop' | string
    force?: boolean
  } & HTMLAttributes<HTMLSpanElement>

  let { type = '', force, ...rest }: Props = $props()

  const options = useOptions()

  let display = $derived.by(() => {
    switch (type) {
      case 'number':
        return 'num'
      case 'string':
        return 'str'
      case 'regexp':
        return 'regex'
      case 'function':
        return 'fn'
      case 'asyncfunction':
        return 'async fn'
      case 'generatorfunction':
        return 'fn*'
      case 'asyncgeneratorfunction':
        return 'async fn*'
      case 'boolean':
        return 'bool'
      case 'url':
        return 'URL'
      case 'urlsearchparams':
        return 'URLSearch'
      case 'map':
        return 'Map'
      case 'set':
        return 'Set'
      case 'date':
        return 'Date'
      case 'object':
        return 'obj'
      case 'array':
        return 'arr'
      case 'promise':
        return 'Promise'
      default:
        return type
    }
  })

  const ALWAYS_VISIBLE_TYPES = [
    'undefined',
    'null',
    'class',
    'function',
    'asyncfunction',
    'generatorfunction',
    'asyncgeneratorfunction',
    'promise',
    'readable',
    'writable',
    'Entry',
    'map',
    'set',
    'date',
    'url',
  ]

  let required = $derived(ALWAYS_VISIBLE_TYPES.includes(type))

  const previewLevel = getPreviewLevel()
</script>

{#if (type && options.value.showTypes && previewLevel === 0) || required || force}
  <Highlight
    value={display}
    fields={['type']}
    alsoMatch={type}
    data-testid="type"
    class={['type', type, previewLevel ?? 'preview']}
    title={type}
    {...rest}
  />
{/if}
