<!--
 @component
 Wrapper for different variants of Inspect
-->
<script lang="ts">
  import { getContext, onDestroy, setContext, type Snippet } from 'svelte'
  import type { SvelteHTMLElements } from 'svelte/elements'
  import { scope } from './attachments/focus.js'
  import * as i from './components/icons/index.js'
  import NodeActionButton from './components/NodeActionButton.svelte'
  import NodeIconButton from './components/NodeIconButton.svelte'
  import Search from './components/Search.svelte'
  import { setAddDestroyCallback, setSearchContext } from './contexts.js'
  import { useOptions } from './options.svelte.js'
  import { useState } from './state.svelte.js'
  import { fly, slide } from './transition/index.js'
  import { createTypingBufferContext } from './typingbuffer.svelte.js'
  import { wait } from './util.js'
  import { clearSearchCache, parseSearchTerms } from './util/search.js'
  import { tinykeys } from './util/hotkeys.js'

  type Props = {
    showExpandCollapse?: boolean
    onlog?: () => void
    oninspectvaluechange?: () => void
    onhandleclick?: () => void
    headingExtra?: Snippet
    heading?: string | Snippet<[boolean]> | boolean
    children: Snippet
  } & SvelteHTMLElements['div']

  let {
    onlog,
    oninspectvaluechange,
    showExpandCollapse = false,
    headingExtra,
    onhandleclick,
    heading,
    children,
    class: classValue,
    ...rest
  }: Props = $props()

  const id = $props.id()
  const inFixed = getContext(Symbol.for('siv.fixed'))
  const collapseState = useState()
  const options = useOptions()
  const destroyCallbacks: (() => void)[] = []
  const typingBuffer = createTypingBufferContext(id)

  let { search, animRate } = $derived(options.value)
  let collapsed = $state(false)
  let searchInput = $state('')
  let matchingPaths = $state([])
  let terms = $derived(search && searchInput.length ? parseSearchTerms(searchInput) : [])
  let wrapperEle = $state<HTMLDivElement>()
  let searchEle = $state<Search>()
  let lastFocusedEle = $state<HTMLElement | null>()
  let settingCollapse = $state<false | 'expanding' | 'collapsing'>(false)

  setSearchContext(() => ({
    searching: searchInput.length > 1,
    matchingPaths,
    query: searchInput,
    terms,
  }))

  setContext(Symbol.for('siv.focus-id'), id)
  setAddDestroyCallback((cb) => {
    destroyCallbacks.push(cb)
  })

  function activeElementInWrapper() {
    return wrapperEle?.contains(document.activeElement)
  }

  // set up hotkeys
  $effect(() => {
    const { hotkeys } = options
    let unbinds: (() => void)[] = []

    if (hotkeys) {
      if (hotkeys.expandTop) {
        unbinds.push(
          tinykeys(window, {
            [hotkeys.expandTop]: (event) => {
              if (!activeElementInWrapper()) return
              event.preventDefault()
              setCollapse(false)
            },
          })
        )
      }
      if (hotkeys.collapseTop) {
        unbinds.push(
          tinykeys(window, {
            [hotkeys.collapseTop]: (event) => {
              if (!activeElementInWrapper()) return
              event.preventDefault()
              setCollapse(true)
            },
          })
        )
      }
      if (hotkeys.search && search) {
        unbinds.push(
          tinykeys(window, {
            [hotkeys.search]: (event) => {
              if (!activeElementInWrapper()) return
              event.preventDefault()
              lastFocusedEle = document.activeElement as HTMLElement
              searchEle?.focus()
            },
          })
        )
      }
    }

    return () => {
      unbinds.forEach((ub) => ub())
    }
  })

  onDestroy(() => {
    for (const callback of destroyCallbacks) {
      callback()
    }
  })

  function onSearchKeyDown(
    event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }
  ) {
    if (event.key === 'Escape' && lastFocusedEle != null) {
      lastFocusedEle.focus()
      lastFocusedEle = null
    }
  }

  export function searchWithQuery(queryText: string) {
    searchInput = queryText
    searchEle?.search()
  }

  let hasExpandedTopLevel = $derived.by(() => {
    if (!showExpandCollapse) return false
    if (settingCollapse) return true
    const paths = Object.entries(collapseState.value).map((e) => e[0])
    for (const p of paths) {
      if (p.split('.').length === 1 && collapseState.value[p].collapsed === false) {
        return true
      }
    }
    return false
  })

  async function setCollapse(collapsed: boolean) {
    if (!settingCollapse) {
      settingCollapse = collapsed ? 'collapsing' : 'expanding'
      const paths = Object.entries(collapseState.value).map((e) => e[0])

      for (const p of collapsed ? paths.toReversed() : paths) {
        if (p.split('.').length === 1) {
          if (collapseState.value[p]?.collapsed !== collapsed) {
            collapseState.setCollapse(p, { collapsed })
            await wait() // avoid forced reflow (and get nice stagger effect)
          }
        }
      }
      settingCollapse = false
    }
  }

  // FIXME: only works for currently visible values but is the "cheapest" cache bust strat for now
  function onNestedValueChange(): void {
    clearSearchCache()
    searchEle?.clearPrevQuery()
  }
</script>

<div
  bind:this={wrapperEle}
  class={['svelte-inspect-value', inFixed && 'in-fixed', classValue]}
  oninspectvaluechange={onNestedValueChange}
  data-focus-id={id}
  style:--transition-rate={animRate}
  {@attach scope(true)}
  {...rest}
>
  {#if heading || search}
    <div
      class="heading"
      class:collapsed
      transition:slide={{ axis: 'y', duration: options.transitionDuration }}
    >
      <button class="heading-collapse-button" onclick={() => (collapsed = !collapsed)}>
        <div class="collapse">
          <i.Caret
            style="rotate: {collapsed
              ? 0
              : 90}deg; transition: rotate var(--__transition-duration) var(--_back-out)"
          />
        </div>
        {#if typeof heading === 'string'}
          <span class="heading-text">
            {heading}
          </span>
        {:else if typeof heading === 'function'}
          {@render heading(collapsed)}
        {/if}
      </button>
      <div class="heading-extra">
        {#if search && !collapsed}
          <Search
            bind:this={searchEle}
            bind:matchingPaths
            bind:query={searchInput}
            onkeydown={onSearchKeyDown}
          />
        {/if}
        {#if showExpandCollapse && !collapsed}
          <NodeIconButton
            title="{hasExpandedTopLevel ? 'collapse' : 'expand'} all"
            onclick={() => setCollapse(hasExpandedTopLevel)}
            disabled={settingCollapse !== false}
          >
            <i.ExpandCollapse expand={!hasExpandedTopLevel} setting={settingCollapse} />
          </NodeIconButton>
          <NodeIconButton onclick={onlog}>
            <i.Console />
          </NodeIconButton>
        {/if}
        {@render headingExtra?.()}
      </div>
    </div>
  {/if}
  {#if !collapsed}
    {#if typingBuffer.current.length}
      <div
        class="typebuffer"
        transition:fly={{ duration: options.transitionDuration, y: 40, opacity: 0 }}
      >
        <div style="height: 1em; width: 1em; flex-shrink: 0">
          <i.Search />
        </div>
        <div style="display: flex">
          {#each typingBuffer.current as c, i (i)}
            <div
              style="color: var(--_text-color); width: 1ch;"
              in:slide={{ axis: 'x', duration: options.transitionDuration }}
            >
              {c}
            </div>
          {/each}{#key typingBuffer.current}<span class="block">▊</span>{/key}
        </div>
      </div>
    {/if}
    <div class="body" transition:slide={{ duration: options.transitionDuration }}>
      <svelte:boundary onerror={console.error}>
        {#snippet failed(_, reset)}
          root error (see console) <NodeActionButton onclick={reset}>reset</NodeActionButton>
        {/snippet}
        {@render children()}
      </svelte:boundary>
    </div>
  {/if}
</div>

<style>
  @import './vars.css';
  @import './themes.css';

  @keyframes markback {
    from {
      scale: 2;
    }
    to {
      scale: 1;
    }
  }

  @keyframes block {
    from {
      transform: scale(1, 1.2);
      color: var(--_text-color);
    }
    to {
      transform: scale(1, 1);
      color: currentColor;
    }
  }

  :global .svelte-inspect-value::selection {
    background-color: var(--_text-selection-background);
    color: var(--_text-color);
  }

  :global .svelte-inspect-value ::selection {
    background-color: var(--_text-selection-background);
    color: var(--_text-color);
  }

  .svelte-inspect-value:not(.noanimate) {
    transition-duration: var(--__transition-duration);
    transition-property: color, background-color, border-color, border;
    transition-timing-function: ease-in-out;
  }

  :global .svelte-inspect-value {
    *,
    *::before,
    *::after {
      box-sizing: border-box;
      margin: 0;
    }
  }

  :global .svelte-inspect-value.noanimate * {
    animation: none !important;
    transition: none !important;
  }

  .svelte-inspect-value {
    position: relative;
    box-sizing: border-box;
    box-sizing: border-box;
    container-type: inline-size;
    margin: 0;
    border: 1px solid var(--_border-color);
    border-radius: var(--_border-radius);
    background: var(--_background);
    background-color: var(--_background-color);
    width: var(--inspect-width, 100%);
    min-width: var(--inspect-min-width, 360px);
    max-width: var(--inspect-max-width, 100%);
    overflow: hidden;
    color: var(--_text-color);
    font-size: var(--inspect-font-size, 12px);
    line-height: 1.5em;
    font-family: var(--inspect-font, monospace);
    text-overflow: ellipsis;
    white-space: nowrap;
    -webkit-font-smoothing: subpixel-antialiased;
    -moz-osx-font-smoothing: grayscale;

    .heading {
      display: flex;
      position: relative;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 1ch;
      border-bottom: 1px solid var(--_border-color);
      padding-inline: 0.25em;
      padding-block: 0.25em;
      min-height: 2em;
      max-height: 2em;
      overflow: hidden;
      color: var(--_text-color);
      font-weight: bold;
      font-size: calc(var(--inspect-font-size, 12px) - 0px);

      .heading-collapse-button {
        all: unset;
        display: flex;
        flex: 0 1 50%;
        align-items: center;
        gap: 0.5em;
        box-sizing: border-box;
        padding-right: 0.25em;
        overflow: hidden;

        &:hover {
          background-color: transparent;
        }

        .heading-text {
          text-overflow: ellipsis;
        }
      }

      .heading-extra {
        display: flex;
        flex: 1 0 60%;
        justify-content: flex-end;
        align-items: center;
        gap: 0.5em;
        max-width: 26em;
      }

      &.collapsed {
        border: none;
      }
    }

    &.borderless {
      border: none;
      border-radius: 0;
      background-color: transparent;

      .body {
        border: none;
        background-color: transparent;
        padding: 0;
      }

      .heading {
        padding-inline: 0.25em;
        font-weight: bold;
      }
    }

    &.dense {
      border: none;
      border-radius: 0;

      .body {
        border: none;
        padding: 0;
      }

      .heading {
        border-bottom: none;
        padding-inline: 0.25em;
      }

      &.in-fixed {
        .body,
        .heading {
          border-top: 1px solid var(--_border-color);
        }
      }
    }

    .typebuffer {
      display: none;
      position: absolute;
      bottom: 0;
      left: 50%;
      justify-content: flex-start;
      align-items: center;
      gap: 0.5em;
      transform: translate(-50%, 0);
      z-index: 1;
      border: 1px solid var(--_border-color);
      border-bottom: none;
      border-radius: var(--_border-radius) var(--_border-radius) 0 0;
      background-color: var(--_background-color);
      padding: 1ch;
      width: 90%;
      max-width: 360px;
      overflow: clip;
      color: var(--_button-color);
      font-size: 1em;
      line-height: 1;
      text-align: left;

      .block {
        transform-origin: center 150%;
        animation-duration: 250ms;
        animation-timing-function: ease-in;
        animation-iteration-count: 1;
        animation-name: block;
        line-height: 1;
      }
    }

    &:focus-within .typebuffer {
      display: flex;
    }
  }

  .svelte-inspect-value.in-fixed {
    display: flex;
    flex-direction: column;
  }

  .svelte-inspect-value:has(.heading) {
    min-height: 26px;

    .body {
      padding-top: 0;
    }
  }

  .body {
    /** compact */
    position: relative;
    transition: padding-top var(--__transition-duration) ease-in-out;
    padding: var(--_padding-compact);
    width: 100%;
    height: 100%;
    overflow: auto;
    --__indent: var(--_indent-compact, 0.5em);
    --line-gap: 0.375em;
    --unit-display: none;

    @container (inline-size > 360px) {
      padding: var(--_padding-compact);
      --__indent: var(--_indent, 0.75em);
      --line-gap: 0.5em;
      --unit-display: inline-flex;
    }
  }

  .svelte-inspect-value :global(.indent) {
    &.string {
      border-color: var(--_string-value-color);
      overflow-x: auto;
    }

    &.function,
    &.asyncfunction,
    &.asyncgeneratorfunction,
    &.generatorfunction {
      border-color: var(--_function-name-color);
      overflow-x: auto;
    }

    &.error {
      border-color: var(--_error-color);
    }
  }

  .svelte-inspect-value :global(.type) {
    flex-shrink: 0;
    transition: color var(--__transition-duration) ease-in-out;
    color: var(--_object-type-color);
    font-weight: 900;
    font-size: 0.857em;

    &.null,
    &.undefined {
      border-radius: 2px;
      background-color: var(--_niltype-bg-color);
      padding-inline: 0.5em;
      height: 1.3em;
      color: var(--_niltype-text-color);
      line-height: 1.3em;
    }

    &.string {
      color: var(--_string-type-color);
    }

    &.number {
      color: var(--_number-type-color);
    }

    &.boolean {
      color: var(--_boolean-type-color);
    }

    &.array {
      color: var(--_array-type-color);
    }

    &.object {
      color: var(--_object-type-color);
    }

    &.bigint {
      color: var(--_bigint-type-color);
    }

    &.error,
    &.InspectError {
      color: var(--_error-color);
    }

    &.regexp {
      color: var(--_regex-type-color);
    }

    &.date {
      color: var(--_date-type-color);
    }

    &.function,
    &.asyncfunction,
    &.asyncgeneratorfunction,
    &.generatorfunction {
      color: var(--_function-type-color);
    }

    &.symbol {
      color: var(--_symbol-type-color);
    }

    &.map {
      color: var(--_map-type-color);
    }

    &.url {
      color: var(--_url-type-color);
    }

    &.urlsearchparams {
      color: var(--_urlsearchparams-type-color);
    }

    &.set {
      color: var(--_set-type-color);
    }

    &.class {
      color: var(--_class-type-color);
    }
  }

  .svelte-inspect-value :global(.value) {
    transition: color var(--__transition-duration) ease-in-out;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.string {
      color: var(--_string-value-color);
    }

    &.multi {
      padding: var(--_indent);
      padding-left: 0.75em;
      overflow-x: auto;
      overflow-y: clip;
      line-height: 1;
      text-overflow: unset;
      white-space: pre;
    }

    &.number {
      color: var(--_number-value-color);
    }

    &.boolean {
      color: var(--_boolean-value-color);
    }

    &.array {
      color: var(--_array-type-color);
    }

    &.object {
      color: var(--_object-type-color);
    }

    &.bigint {
      color: var(--_bigint-value-color);
    }

    &.url {
      color: var(--_url-type-color);
    }

    &.urlsearchparams {
      color: var(--_urlsearchparams-type-color);
    }

    &.error {
      color: var(--_error-color);
    }

    &.regexp {
      color: var(--_regex-value-color);
    }

    &.date {
      color: var(--_date-type-color);
    }

    &.function {
      color: var(--_function-name-color);
    }

    &.symbol {
      color: var(--_symbol-value-color);
    }

    &.map {
      color: var(--_map-type-color);
    }

    &.class {
      color: var(--_class-name-color);
    }

    &.html {
      padding-inline: 0.5em;
    }
  }

  .svelte-inspect-value :global(a) {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .svelte-inspect-value :global(code) {
    font-size: inherit;
    font-family: inherit;
  }

  .svelte-inspect-value :global(mark) {
    all: unset;
    box-sizing: border-box;
    /* outline: 1px solid black; */
    border-radius: 2px;
    background-color: var(--_text-search-highlight-color);
    height: 1em;
    height: 100%;
    overflow: visible;
    color: var(--_background-color);
    line-height: 1.5;
    /* text-decoration: underline; */
    /* text-decoration-style: wavy; */
    /* text-decoration-color: var(--_text-search-highlight-color); */
    /* text-decoration */
    /* text-decoration-thickness: 1px; */
  }

  .collapse {
    all: unset;
    all: unset;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    transition: color var(--__transition-duration) ease-in-out;
    cursor: pointer;
    margin: 0;
    border: none;
    padding: 0;
    aspect-ratio: 1 / 1;
    width: 1em;
    min-width: 1em;
    max-width: 1em;
    height: 1em;
    overflow: visible;
    color: var(--_caret-color);
    user-select: none;

    &:hover {
      background-color: transparent;
      color: var(--_caret-hover-color);
    }

    &:focus {
      color: var(--_caret-focus-color);
    }

    &:focus-visible {
      transform: scale(1.2);
      color: var(--_caret-focus-color);
    }

    &:disabled {
      cursor: default;
    }

    * {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  }
</style>
