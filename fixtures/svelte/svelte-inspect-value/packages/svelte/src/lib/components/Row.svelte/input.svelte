<!--
  @component Row

  Handles interaction for both expandable and single-line nodes
-->
<script lang="ts">
  import {
    enterFocusScope,
    exitFocusScope,
    focusFirst,
    focusLast,
    focusNext,
    focusPrev,
    focusTarget,
  } from '../attachments/focus.js'
  import { getContext, tick, type Snippet } from 'svelte'
  import { getTypingBuffer } from '../typingbuffer.svelte.js'
  import { useOptions } from '../options.svelte.js'

  type Props = {
    collapsed?: boolean
    disabled?: boolean
    isFocusTarget?: boolean
    previewLevel?: number
    borderless?: boolean
    children: Snippet
    onchange?: (collapsed: boolean) => void
  }

  let {
    collapsed,
    disabled = true,
    children,
    onchange,
    isFocusTarget,
    previewLevel = 0,
    borderless = false,
  }: Props = $props()

  const focusId = getContext<string>(Symbol.for('siv.focus-id'))
  const typingBuffer = getTypingBuffer()
  const options = useOptions()

  function onclick() {
    onchange?.(!collapsed)
  }

  function onkeydown(event: KeyboardEvent) {
    let shouldPreventDefault = true
    if (event.metaKey || event.ctrlKey || event.altKey) return // no modifier keys

    if (event.key.length === 1 && options.value.typeToFocus) {
      typingBuffer.type(event.key)
      return
    }

    if (options.value.disableKeynav) return

    switch (event.code) {
      case 'Space': {
        onchange?.(!collapsed)
        break
      }
      case 'ArrowUp': {
        focusPrev(focusId)
        break
      }
      case 'ArrowDown': {
        focusNext(focusId)
        break
      }
      case 'ArrowLeft': {
        if (!collapsed) {
          onchange?.(true)
        } else {
          exitFocusScope(focusId)
        }
        break
      }
      case 'Enter': {
        if (!disabled) {
          if (collapsed) {
            onchange?.(false)
            tick().then(enterFocusScope)
          } else {
            const didFocus = enterFocusScope()
            if (!didFocus) {
              onchange?.(true)
            }
          }
        } else {
          focusNext(focusId)
        }
        break
      }
      case 'ArrowRight': {
        if (collapsed && !disabled) {
          onchange?.(false)
        } else {
          if (!enterFocusScope()) {
            focusNext(focusId)
          }
        }
        break
      }
      case 'Home': {
        focusFirst(focusId)
        break
      }
      case 'End': {
        focusLast(focusId)
        break
      }
      default: {
        shouldPreventDefault = false
        break
      }
    }
    if (shouldPreventDefault) {
      event.preventDefault()
    }
  }
</script>

<div
  data-testid="row"
  role="button"
  class={['row-target', disabled && 'disabled', !borderless && 'full-width']}
  aria-disabled={disabled}
  tabindex={previewLevel > 0 ? -1 : 0}
  {onclick}
  onkeydown={!options.value.disableKeynav || options.value.typeToFocus ? onkeydown : undefined}
  {@attach focusTarget(isFocusTarget)}
>
  {@render children()}
</div>

<style>
  .row-target {
    all: unset;
    display: flex;
    position: relative;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: var(--line-gap, 0.5em);
    transform-origin: 0% 50%;
    cursor: default;
    box-sizing: border-box;
    height: 100%;
    max-height: 1.5em;

    &:hover {
      background-color: transparent;
    }
  }

  .row-target.full-width {
    width: 100%;
  }

  :global .row-target:focus {
    .collapse {
      transform: scale(1.2);
      color: var(--_caret-focus-color);
    }

    .bullet .dash {
      border-radius: 4px;
      background-color: var(--_caret-focus-color);
      width: 8px;
    }
  }

  :global .row-target:hover {
    .collapse {
      color: var(--_caret-hover-color);
    }

    .bullet .dash {
      border-radius: 4px;
      background-color: var(--_caret-hover-color);
      height: 2px;
    }
  }
</style>
