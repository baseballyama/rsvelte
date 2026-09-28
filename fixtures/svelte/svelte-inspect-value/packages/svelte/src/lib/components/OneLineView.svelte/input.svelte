<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { getIsKey, getPreviewLevel } from '../contexts.js'
  import { useOptions } from '../options.svelte.js'
  import type { TypeViewProps } from '../types.js'
  import Bullet from './Bullet.svelte'
  import Count from './Count.svelte'
  import Highlight from './Highlight.svelte'
  import Key from './Key.svelte'
  import NodeNote from './NodeNote.svelte'
  import Row from './Row.svelte'
  import Tools from './Tools.svelte'
  import Type from './Type.svelte'

  type Props = TypeViewProps<unknown> & HTMLAttributes<HTMLDivElement>

  let {
    value,
    display,
    key,
    showKey = true,
    keyDelim = ':',
    keyPrefix,
    keyStyle,
    type,
    forceType,
    path,
    length,
    showLength = true,
    note,
    match,
    children,
    ...rest
  }: Props = $props()

  const options = useOptions()
  const { borderless, showLength: optsShowLength } = $derived(options.value)
  let previewLevel = getPreviewLevel()
  let isKey = getIsKey()
  let displayOrValue = $derived(display != null ? display : (value?.toString?.() ?? ''))
  let title = $derived(
    typeof value === 'string' ? value : display != null ? display : value?.toString()
  )
</script>

<div
  data-testid="line"
  class={['line', match && 'match', (previewLevel || isKey) && 'preview', !showKey && 'nokey']}
  {...rest}
>
  <Row
    collapsed={true}
    disabled={true}
    isFocusTarget={previewLevel === 0}
    {previewLevel}
    {borderless}
  >
    {#if !previewLevel && !isKey}
      <Bullet {value} />
    {/if}
    {#if showKey}
      <Key disabled prefix={keyPrefix} delim={keyDelim} style={keyStyle} {key} {path} />
    {/if}
    {#if !isKey}
      <Type {type} force={forceType} />
    {/if}
    {#if children}
      {@render children()}
    {:else if displayOrValue}
      <Highlight
        data-testid="value"
        {title}
        class={['value', type]}
        value={displayOrValue}
        fields={['value']}
      />
    {/if}

    {#if note && !previewLevel}
      <NodeNote title={note.description}>{note.title}</NodeNote>
    {/if}
    {#if typeof length === 'number' && showLength && optsShowLength && !previewLevel}
      <Count {length} {type} />
    {/if}
  </Row>

  {#if !isKey && !previewLevel}
    <Tools {value} {path} {type}></Tools>
  {/if}
</div>

<style>
  @import './styles/line.css';
</style>
