<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { scope } from '../attachments/focus.js'
  import { getIsKey, getPreviewLevel } from '../contexts.js'
  import { useOptions } from '../options.svelte.js'
  import { useState } from '../state.svelte.js'
  import { slideXY } from '../transition/index.js'
  import type { TypeViewProps } from '../types.js'
  import { neverExpandInitial, shouldInitiallyExpandNode, stringifyPath } from '../util.js'
  import CollapseButton from './CollapseButton.svelte'
  import Count from './Count.svelte'
  import Key from './Key.svelte'
  import NodeNote from './NodeNote.svelte'
  import Row from './Row.svelte'
  import Tools from './Tools.svelte'
  import Type from './Type.svelte'

  type Props = TypeViewProps<unknown> & {
    valuePreview: Snippet<[{ showPreview: boolean }]>
    forceType?: boolean
    keyDelim?: string
    showKey?: boolean
    children?: Snippet
    keepPreviewOnExpand?: boolean
  } & HTMLAttributes<HTMLDivElement>

  let {
    key,
    keyPrefix,
    keyDelim = ':',
    keyStyle,
    showKey = true,
    type,
    length,
    value,
    valuePreview,
    forceType = false,
    keepPreviewOnExpand = false,
    path = [],
    showLength = true,
    children,
    note,
    match,
    ...rest
  }: Props = $props()

  let collapseButton = $state<CollapseButton>()
  const options = useOptions()
  const inspectState = useState()
  const previewLevel = getPreviewLevel()
  const isKey = getIsKey()
  let {
    expandAll,
    expandPaths,
    showLength: optsShowLength,
    borderless,
    easing,
  } = $derived(options.value)
  let expandingDisabled = $derived(length === 0 || previewLevel > 0)
  let stringifiedPath = $derived(stringifyPath(path))
  let collapseState = $derived(inspectState.value[stringifiedPath])
  let collapsed = $derived.by(() => {
    if (previewLevel || !length) return true

    if (collapseState) {
      return collapseState.collapsed
    }
    // while waiting for onMount to run, check expandLevel.
    // this avoids playing the indent intro animation.
    return path.length > options.expandLevel || neverExpandInitial.includes(key)
  })

  onMount(() => {
    if (previewLevel) return

    if (inspectState && previewLevel === 0) {
      const storedState = inspectState.getCollapse(path)
      if (!storedState) {
        inspectState.setCollapse(path, {
          collapsed: !shouldInitiallyExpandNode(path, options.expandLevel, expandAll, expandPaths),
        })
      }
    }
  })

  function setCollapse(collapsed: boolean) {
    if (!expandingDisabled) {
      inspectState.setCollapse(stringifiedPath, { collapsed })
    }
  }

  let shouldRenderChildren = $derived.by(() => {
    if (match && type !== 'string' && type !== 'function') {
      return length != null && length > 0 && !previewLevel
    } else {
      return length != null && length > 0 && !collapsed && !previewLevel
    }
  })

  export function flash() {
    collapseButton?.flashButton()
  }
</script>

<div
  data-testid="expandable"
  class={['line', previewLevel && 'preview', !showKey && 'nokey', match && 'match']}
  aria-expanded={!collapsed}
  {...rest}
>
  <Row
    {collapsed}
    {previewLevel}
    {borderless}
    disabled={expandingDisabled}
    onchange={setCollapse}
    isFocusTarget={previewLevel === 0}
  >
    {#if !previewLevel && !isKey}
      <CollapseButton
        bind:this={collapseButton}
        {collapsed}
        {value}
        {key}
        {type}
        disabled={expandingDisabled}
      />
    {/if}
    {#if showKey}
      <Key
        disabled={expandingDisabled}
        delim={keyDelim}
        prefix={keyPrefix}
        style={keyStyle}
        {key}
        {path}
      />
    {/if}
    {#if !isKey}
      <Type {type} force={forceType} />
    {/if}

    {@render valuePreview({
      showPreview: collapsed || previewLevel > 0 || keepPreviewOnExpand,
    })}

    {#if note && !previewLevel}
      <NodeNote style="justify-self: right;" title={note.description}>{note.title}</NodeNote>
    {/if}

    {#if typeof length === 'number' && showLength && optsShowLength && !previewLevel}
      <Count {length} {type} />
    {/if}
  </Row>

  {#if !previewLevel}
    <Tools {value} {path} {collapsed} {type}></Tools>
  {/if}
</div>

{#if children && shouldRenderChildren}
  <div
    transition:slideXY={{ duration: options.transitionDuration, easing }}
    oninspectvaluechange={() => collapseButton?.flash()}
    role="list"
    data-testid="indent"
    class={['indent', type, match && 'match']}
    {@attach scope(previewLevel === 0)}
  >
    {@render children()}
  </div>
{/if}

<style>
  @import './styles/line.css';

  .indent {
    position: relative;
    transition-duration: var(--__transition-duration);
    transition-property: margin-left, border-color;
    margin-left: var(--__indent);
    border-left: 1px solid var(--_indent-color);
    max-height: calc(102 * 1.5em);
    overflow-x: clip;
    overflow-y: auto;

    &.match {
      border-color: var(--base0A);
    }
  }

  :global .indent:has(.highlight):not(.match) {
    border-color: color-mix(in srgb, var(--_indent-color), var(--_text-search-highlight-color) 50%);
  }
</style>
