<script lang="ts">
  import type { Direction } from './types.js'

  type Props = {
    handles: Direction[]
    ele: HTMLElement
    enabled?: boolean
    resizing?: boolean
    width: number | undefined
    height: number | undefined
    onResize: (dimensions: 'width' | 'height') => void
  }

  let {
    ele,
    handles,
    enabled = true,
    resizing = $bindable(false),
    width = $bindable(),
    height = $bindable(),
    onResize,
  }: Props = $props()

  let initialRect: DOMRect | null = null
  let initialPos: { x: number; y: number } | null = null

  let activeDir = $state<Direction>()

  function onmousedown(
    event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    handle: Direction
  ) {
    activeDir = handle
    resizing = true
    initialPos = { x: event.pageX, y: event.pageY }
    initialRect = ele.getBoundingClientRect()
  }

  function onmousemove(event: MouseEvent & { currentTarget: EventTarget & Window }) {
    if (!activeDir) return
    if (!initialPos) return
    if (!initialRect) return

    const direction = activeDir
    let delta: number
    if (direction === 'right') {
      delta = event.pageX - initialPos.x
      width = initialRect.width + delta
    } else if (direction === 'left') {
      delta = initialPos.x - event.pageX
      width = initialRect.width + delta
    } else if (direction === 'top') {
      delta = initialPos.y - event.pageY
      height = initialRect.height + delta
    } else if (direction === 'bottom') {
      delta = event.pageY - initialPos.y
      height = initialRect.height + delta
    }
  }

  function onmouseup(_event: MouseEvent & { currentTarget: EventTarget & Window }) {
    if (!activeDir) return
    const dimension: 'width' | 'height' = ['left', 'right'].includes(activeDir) ? 'width' : 'height'
    activeDir = undefined
    resizing = false
    initialPos = null
    initialRect = null
    onResize(dimension)
  }

  function ongrabberdblclick(
    _e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
    handle: Direction
  ) {
    const dimension: 'width' | 'height' = ['left', 'right'].includes(handle) ? 'width' : 'height'

    if (['left', 'right'].includes(handle)) {
      width = undefined
    } else {
      height = undefined
    }
    onResize(dimension)
  }
</script>

<svelte:window {onmouseup} {onmousemove} />

{#if enabled}
  {#each handles as handle (handle)}
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button
      class:selected={handle === activeDir}
      class="grabber {handle}"
      onmousedown={(e) => onmousedown(e, handle)}
      ondblclick={(e) => ongrabberdblclick(e, handle)}
      tabindex={-1}
    ></button>
  {/each}
{/if}

<style>
  .grabber {
    --resizable-thickness: 5px;
    --resizable-offset: calc((var(--resizable-thickness)) * -1);
    all: unset;
    position: absolute;
    z-index: 10;
    cursor: col-resize;
    box-sizing: border-box;
    background-color: transparent !important;

    &:focus-visible {
      opacity: 0.5;
      background-color: white !important;
    }
  }

  .grabber.right {
    top: 0;
    right: var(--resizable-offset);
    bottom: 0;
    width: var(--resizable-thickness);
    height: 100%;
  }

  .grabber.left {
    top: 0;
    bottom: 0;
    left: var(--resizable-offset);
    width: var(--resizable-thickness);
    height: 100%;
  }

  .grabber.top {
    top: var(--resizable-offset);
    right: 0;
    left: 0;
    cursor: row-resize;
    width: 100%;
    height: var(--resizable-thickness);
  }

  .grabber.bottom {
    right: 0;
    bottom: var(--resizable-offset);
    left: 0;
    cursor: row-resize;
    width: 100%;
    height: var(--resizable-thickness);
  }

  .grabber.selected {
    opacity: 0.5;
  }
</style>
