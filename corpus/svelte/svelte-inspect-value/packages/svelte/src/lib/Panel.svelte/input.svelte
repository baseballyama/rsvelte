<script module lang="ts">
  import { SvelteSet } from 'svelte/reactivity'
  import { PersistedState, type PersistedStateOptions } from './util/persisted.svelte.js'

  export let globalInspectState = $state({
    mounted: new SvelteSet<string>(),
  })

  const persistDefaults: PersistedStateOptions<PanelSettings> = {
    key: 'siv.panel',
    storage: 'local',
    syncTabs: false,
  } as const

  function createPersistState(
    initialValue: PanelSettings,
    persist: PanelProps['persist'],
    persistSync: PanelProps['persistSync']
  ) {
    let opts: PersistedStateOptions<PanelSettings>
    if (persist === true) {
      opts = persistDefaults
    } else if (typeof persist === 'string') {
      opts = { ...persistDefaults, key: persist }
    } else if (typeof persist === 'object') {
      opts = { ...persistDefaults, ...persist }
    } else if (persistSync === true) {
      opts = { ...persistDefaults, syncTabs: true }
    } else if (typeof persistSync === 'string') {
      opts = { ...persistDefaults, key: persistSync, syncTabs: true }
    } else if (typeof persistSync === 'object') {
      opts = { ...persistDefaults, ...persistSync, syncTabs: true }
    } else {
      return undefined
    }
    return new PersistedState(initialValue, opts)
  }
</script>

<script lang="ts">
  import { BROWSER } from 'esm-env'
  import { setContext, untrack } from 'svelte'
  import type { ClassValue } from 'svelte/elements'
  import { fade } from 'svelte/transition'
  import CollapseStateProvider from './CollapseStateProvider.svelte'
  import Node from './components/Node.svelte'
  import NodeActionButton from './components/NodeActionButton.svelte'
  import PropertyList from './components/PropertyList.svelte'
  import { globalValues } from './global.svelte.js'
  import { logToConsole } from './hello.svelte.js'
  import { createOptions, getGlobalInspectOptions, mergeOptions } from './options.svelte.js'
  import PanelToolbar from './PanelToolbar.svelte'
  import Resize from './Resize.svelte'
  import type { Direction, PanelProps, PanelSettings, PositionProp, XPos, YPos } from './types.js'
  import { getAllProperties, initialize, sortProps } from './util.js'
  import Wrapper from './Wrapper.svelte'

  let {
    // base props
    value,
    values,
    name,
    // panel props
    align = $bindable('right full'),
    appearance = $bindable('solid'),
    open = $bindable(false),
    opacity = $bindable(false),
    width = $bindable(),
    height = $bindable(),
    hideToolbar = false,
    hideGlobalValues = false,
    resize = true,
    openOnHover = false,
    zIndex = 1000,
    wiggleOnUpdate = true,
    onOpenChange,
    onSettingsChange = () => void 0,
    persist = false,
    persistSync = false,
    children,
    // inspect options and element attributes
    class: className,
    ...rest
  }: PanelProps = $props()

  const id = $props.id()
  let fullScreen = $state(false)
  let hovered = $state(false)
  let flash = $state(false)
  let resizing = $state(false)
  let panelEle = $state<HTMLElement>()
  let [optionsProps, restProps] = $derived(sortProps(rest))
  let initialized = false
  let globalOptions = getGlobalInspectOptions()
  let mergedOptions = $derived(
    mergeOptions(
      { ...optionsProps },
      typeof globalOptions === 'function' ? globalOptions() : globalOptions
    )
  )
  let options = createOptions(() => mergedOptions)
  const handleLabel = $derived(open ? 'close panel' : 'open panel')
  const persistedSettings = createPersistState(
    { open, align, opacity, appearance, width, height },
    // svelte-ignore state_referenced_locally
    persist,
    // svelte-ignore state_referenced_locally
    persistSync
  )

  function setSettingsFrom(source: PanelSettings) {
    align = source.align ?? align
    open = source.open ?? open
    appearance = source.appearance ?? appearance
    opacity = source.opacity ?? opacity
    width = source.width ?? width
    height = source.height ?? height
    settingsChanged()
  }

  $effect.pre(() => {
    if ((persist || persistSync) && !initialized && persistedSettings) {
      setSettingsFrom(persistedSettings.current)
      initialized = true
    }
  })

  let globalEntries = $derived.by(() => {
    const entries = [...globalValues.entries()].map(([k, v]) => [k, v.value] as const)
    return Object.fromEntries(entries)
  })

  let shouldBeOpen = $derived.by(() => {
    if (openOnHover) {
      return hovered || open
    }
    return open
  })

  let [xPos, yPos = 'full', xPosClassname, yPosClassname] = $derived.by(() => {
    let [x, y = 'full'] = align.split(' ') as [XPos, YPos]

    if (['full', 'center'].includes(x)) {
      if (!['top', 'bottom'].includes(y)) {
        y = 'top'
      }
    }
    if (['full', 'middle'].includes(y)) {
      if (!['right', 'left'].includes(x)) {
        x = 'right'
      }
    }

    return [x, y, x === 'full' ? 'full-x' : x, y === 'full' ? 'full-y' : y]
  })

  let keys = $derived.by(() => {
    if (values) return getAllProperties(values)
    return []
  })

  let resizableHandles = $derived.by(() => {
    const ret = [] as Direction[]

    if (!resize) return []

    if (['bottom', 'middle'].includes(yPos)) {
      ret.push('top')
    }

    if (['right', 'center'].includes(xPos)) {
      ret.push('left')
    }

    if (['left', 'center'].includes(xPos)) {
      ret.push('right')
    }

    if (['top', 'middle'].includes(yPos)) {
      ret.push('bottom')
    }

    return ret
  })

  let useWidth = $derived(resizableHandles.includes('left') || resizableHandles.includes('right'))
  let useHeight = $derived(resizableHandles.includes('top') || resizableHandles.includes('bottom'))
  let widthPx = $derived(useWidth && width && !fullScreen ? `${width}px` : undefined)
  let heightPx = $derived(useHeight && height && !fullScreen ? `${height}px` : undefined)
  let { theme, noanimate, animRate, borderless, heading, onCollapseChange, onLog } = $derived(
    options.value
  )

  const renderIfValue = $derived(
    typeof options.value.renderIf === 'function'
      ? Boolean(options.value.renderIf())
      : Boolean(options.value.renderIf)
  )

  let shouldRender = $derived(renderIfValue && (persist ? BROWSER : true))
  let wrapperClasses = $derived<ClassValue>([theme, borderless && 'borderless'])

  $effect(() => {
    globalValues.keys()
    untrack(() => {
      if (wiggleOnUpdate) oninspectvaluechange()
    })
  })

  $effect(() => {
    if (!hideGlobalValues && shouldRender) {
      untrack(() => globalInspectState.mounted.add(id))
    }

    return () => {
      globalInspectState.mounted.delete(id)
    }
  })

  setContext(Symbol.for('siv.fixed'), true)
  initialize(options)

  function oninspectvaluechange(): void {
    if (flash) return
    flash = true
    setTimeout(() => {
      flash = false
    }, 500)
  }

  function onAlignChange(x: XPos, y: YPos) {
    align = `${x} ${y}` as PositionProp
    settingsChanged(['align'])
  }

  function onHandleClick() {
    open = !open
    hovered = false
    onOpenChange?.(open)
    settingsChanged(['open'])
  }

  function toggleOpacity() {
    opacity = !opacity
    settingsChanged(['opacity'])
  }

  function settingsChanged(
    key: (keyof PanelSettings)[] = ['opacity', 'appearance', 'width', 'height', 'open', 'opacity']
  ) {
    if (persistedSettings) {
      persistedSettings.current = { open, appearance, opacity, align, width, height }
    }
    onSettingsChange?.({ open, align, opacity, appearance, width, height }, key)
  }

  function log() {
    if (onLog) {
      onLog(values, 'values', ['Inspect.Panel#values'])
    } else {
      logToConsole(['Inspect.Panel#values'], values, 'values')
    }
  }

  function logGlobalValues() {
    if (onLog) {
      onLog(globalValues, 'globalValues', ['globalValues'])
    } else {
      logToConsole(['Inspect.Panel'], Object.fromEntries(globalValues.entries()), 'globalValues')
    }
  }
</script>

{#if shouldRender}
  <aside
    bind:this={panelEle}
    {oninspectvaluechange}
    onpointerenter={() => (hovered = true)}
    onpointerleave={() => (hovered = false)}
    style:width={widthPx}
    style:height={heightPx}
    style:z-index={zIndex}
    style:--transition-rate={animRate}
    class={[
      'inspect-panel',
      theme,
      fullScreen ? 'full' : [xPosClassname, yPosClassname],
      appearance,
      borderless && 'borderless',
      noanimate && 'noanimate',
      opacity && 'opacity',
      flash && wiggleOnUpdate && !hideGlobalValues && 'flash',
      shouldBeOpen && 'open',
      openOnHover && 'hoverable',
      resizing && 'resizing',
      className,
    ]}
    transition:fade={{ duration: options.transitionDuration }}
    {...restProps}
  >
    {#if panelEle}
      <Resize
        bind:width
        bind:height
        bind:resizing
        handles={resizableHandles}
        ele={panelEle}
        enabled={resize}
        onResize={(key) => settingsChanged([key])}
      />
    {/if}
    <button
      onclick={onHandleClick}
      class="handle"
      type="button"
      aria-label={handleLabel}
      title={handleLabel}
    >
      <div class="caret">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"
          ><path
            stroke="currentColor"
            stroke-width={openOnHover ? (open ? 0 : 80) : 0}
            stroke-linecap="butt"
            stroke-linejoin="bevel"
            fill={openOnHover ? (open ? 'currentColor' : 'transparent') : 'currentColor'}
            d="M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37"
          /></svg
        >
      </div>
    </button>
    {#if !hideToolbar}
      <PanelToolbar
        {xPos}
        {yPos}
        {onAlignChange}
        {opacity}
        {toggleOpacity}
        {settingsChanged}
        showResetButton={Boolean(resize && (widthPx || heightPx))}
        onReset={() => {
          width = undefined
          height = undefined
          settingsChanged(['width', 'height'])
        }}
        bind:fullScreen
        bind:appearance
      />
    {/if}
    {#if value || name || (keys.length && values)}
      <CollapseStateProvider {onCollapseChange} {value} {name} {keys} {values}>
        <Wrapper
          class={wrapperClasses}
          {heading}
          style={hideToolbar && appearance === 'dense' ? 'border-top: none' : ''}
          showExpandCollapse={values != null}
          onlog={log}
        >
          {#if values && keys.length}
            <PropertyList value={values} {keys} />
          {:else if name || value}
            <Node {value} key={name} />
          {:else}
            <div style="color: var(--_comment-color); text-align: center">no value</div>
          {/if}
        </Wrapper>
      </CollapseStateProvider>
    {/if}
    {#if globalValues.size > 0 && !hideGlobalValues}
      <CollapseStateProvider
        {onCollapseChange}
        values={globalEntries}
        keys={Array.from(globalValues.keys())}
      >
        <Wrapper class={wrapperClasses} showExpandCollapse onlog={logGlobalValues}>
          {#snippet heading()}
            global values
          {/snippet}
          {#snippet headingExtra()}
            <NodeActionButton onclick={() => globalValues.clear()}>clear</NodeActionButton>
          {/snippet}
          {#each globalValues as [key, entry] (key)}
            <Node note={entry.note} key={key as PropertyKey} value={entry.value} />
          {/each}
        </Wrapper>
      </CollapseStateProvider>
    {/if}
    {#if children}
      {@render children?.()}
    {/if}
  </aside>
{/if}

<style>
  @import './themes.css';
  @import './vars.css';

  :global(.inspect-panel) {
    *,
    *::before,
    *::after {
      box-sizing: border-box;
      margin: 0;
    }
  }

  :global .inspect-panel.noanimate * {
    transition: none !important;
  }

  .inspect-panel.noanimate {
    transition: none !important;
  }

  @keyframes wiggle {
    0%,
    100% {
      translate: 0;
    }
    25% {
      translate: -1%;
    }
    50% {
      translate: 1%;
    }
    75% {
      translate: -1%;
    }
  }

  .inspect-panel {
    --closed-percent: 100%;
  }

  .inspect-panel.hoverable {
    --closed-percent: calc(100% - 0.5em);
  }

  .inspect-panel {
    --border-radius: 8px;
    --handle-offset: 0;
    --inspect-min-width: 100%;
    --panel-t-dur: var(--__transition-duration);
    --panel-t-dur-slow: calc(var(--__transition-duration) * 1.6);
    display: flex;
    position: fixed;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5em;
    transform: translateX(var(--translate-x, 0)) translateY(var(--translate-y, 0));
    transition:
      background-color var(--panel-t-dur) ease-in-out,
      outline-color var(--panel-t-dur) ease-in-out,
      color var(--panel-t-dur) ease-in-out,
      width var(--panel-t-dur-slow) ease-in-out,
      height var(--panel-t-dur-slow) ease-in-out,
      top var(--panel-t-dur-slow) ease-in-out,
      left var(--panel-t-dur-slow) ease-in-out,
      bottom var(--panel-t-dur-slow) ease-in-out,
      right var(--panel-t-dur-slow) ease-in-out,
      opacity var(--panel-t-dur) ease-in-out,
      border var(--panel-t-dur) ease-in-out,
      outline var(--panel-t-dur) ease-in-out,
      transform var(--panel-t-dur) ease-in-out;
    box-sizing: border-box;
    container-type: inline-size;
    background-color: transparent;
    padding: 0.5em;
    width: 420px;
    min-height: 100px;
    max-height: 100vh;
    overflow: visible;
    font-size: var(--inspect-font-size, 12px);
    font-family: var(--_inspect-font, monospace);

    .handle {
      all: unset;
      display: flex;
      position: fixed;
      justify-content: center;
      align-items: center;
      z-index: 20;
      transition:
        all var(--panel-t-dur-slow) ease-in-out,
        background-color 0ms,
        border 0ms;
      cursor: pointer;
      box-sizing: border-box;

      .caret {
        rotate: 180deg;
        transition: all var(--__transition-duration) ease-in-out 200ms;
        width: 100%;
        height: 100%;
        color: var(--_button-color);
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }

    &.open .handle .caret {
      rotate: none;
    }

    &.resizing {
      transition: none;
      outline: 1px solid var(--_button-color);

      .handle {
        transition: none;
        border-color: var(--_button-color) !important;
      }
    }

    &.dense {
      gap: 0;
      border: 1px solid var(--_border-color);
      border-radius: 0 !important;
      background-color: var(--_background-color);
      padding: 0;

      .handle {
        transform-origin: 100% 50%;
        box-shadow: -1px 0px 1px var(--_border-color) inset;
        border: 1px double var(--_border-color);
        border-right: none;
        border-radius: 0;
        background-color: inherit;
        width: 20px;
        height: 40px;

        &:hover,
        &:focus {
          background-color: var(--_hover-color);
        }
      }

      :global(.toolbar) {
        border: none;
        background-color: transparent;
      }

      :global .svelte-inspect-value {
        border: none;
        border-top: 1px solid var(--_border-color);
        border-radius: 0;
        background-color: transparent;
        padding: 0;
      }
    }

    &.solid {
      --solid-bg: color-mix(in srgb, var(--_background-color), black 20%);
      border: 1px solid var(--_border-color);
      background-color: var(--solid-bg);

      &.borderless {
        background-color: var(--_background-color);

        :global(.toolbar) {
          border: none;
          background-color: transparent;
        }

        .handle {
          &:hover,
          &:focus {
            background: linear-gradient(
              to right,
              var(--_hover-color) 20%,
              var(--_background-color) 90%
            );
          }
        }
      }

      .handle {
        transform-origin: 100% 50%;
        border: 1px solid var(--_border-color);
        border-right: none;
        border-radius: var(--border-radius) 0 0 var(--border-radius);
        background-color: inherit;
        width: 20px;
        height: 40px;

        &:hover,
        &:focus {
          background: linear-gradient(to right, var(--_hover-color) 20%, var(--solid-bg) 90%);
        }
      }
    }

    &.glassy {
      backdrop-filter: blur(5px);
      background-color: color-mix(in srgb, var(--_background-color), rgba(255 255 255 / 0.1) 50%);

      .handle {
        transform-origin: 100% 50%;
        border-right: none;
        border-radius: var(--border-radius) 0 0 var(--border-radius);
        background-color: inherit;
        width: 20px;
        height: 40px;

        &:hover,
        &:focus {
          background-color: color-mix(in srgb, var(--_hover-color), rgba(255 255 255 / 0.1) 50%);
        }
      }
    }

    &.floating {
      --handle-offset: -1em;
      outline: 1px solid transparent;
      background-color: transparent;

      &:hover {
        outline-color: var(--_button-color);
      }

      .handle {
        transform-origin: 100% 50%;
        border: 1px solid var(--_border-color);
        border-radius: 9999px;
        background-color: var(--_background-color);
        width: 30px;
        height: 30px;

        .caret {
          width: 15px;
          height: 15px;
        }

        &:hover,
        &:focus {
          background-color: var(--_hover-color);
        }
      }
    }

    &.full {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      opacity: 1 !important;
      transition: all 0ms ease-in-out;
      border: none;
      border-radius: 0;
      width: 100%;
      max-width: 100%;

      .handle {
        display: none;
      }
    }

    &.flash:not(.open) {
      animation-duration: 0.5s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-name: wiggle;
    }

    &.opacity {
      opacity: 0.5;
    }

    &:hover,
    &:focus-within {
      opacity: 1;
    }

    &.top {
      top: 0;
      border-top: none;
      max-height: calc(100% - 30px);

      &.right .handle,
      &.left .handle {
        top: 12px;
      }

      &.center .handle,
      &.full-x .handle {
        bottom: var(--handle-offset);
        left: 50%;
        transform: rotate(-90deg) translate(-100%, -50%);
      }

      &.center {
        border-bottom-right-radius: var(--border-radius);
        border-bottom-left-radius: var(--border-radius);
      }

      &.full-x,
      &.center {
        --translate-y: calc(var(--closed-percent) * -1);
      }

      &.open {
        --translate-y: 0;
      }
    }

    &.middle {
      top: 50%;
      max-height: 100%;
      --translate-y: -50%;

      &.open {
        --translate-y: -50%;
        --translate-x: 0;
      }

      .handle {
        top: calc(50% - 40px);
      }
    }

    &.bottom {
      bottom: 0;
      justify-content: flex-end;
      border-bottom: none;
      max-height: calc(100% - 30px);

      &.right .handle,
      &.left .handle {
        bottom: 12px;
      }

      &.center .handle,
      &.full-x .handle {
        top: var(--handle-offset);
        left: 50%;
        transform: rotate(90deg) translate(-100%, 50%);
      }

      &.center {
        border-top-right-radius: var(--border-radius);
        border-top-left-radius: var(--border-radius);
      }

      &.full-x,
      &.center {
        --translate-y: var(--closed-percent);
      }

      &.open.center,
      &.open.full-x {
        --translate-y: 0;
      }
    }

    &.right {
      --translate-x: var(--closed-percent);
      right: 0;
      border-right: none;
      max-width: calc(100vw - 30px);

      .handle {
        left: var(--handle-offset);
        transform: translateX(-100%);
      }

      &.open {
        --translate-x: 0;
      }

      &.top,
      &.middle {
        border-bottom-left-radius: var(--border-radius);
      }

      &.bottom,
      &.middle {
        border-top-left-radius: var(--border-radius);
      }
    }

    &.left {
      --translate-x: calc(var(--closed-percent) * -1);
      left: 0;
      border-left: none;

      .handle {
        right: var(--handle-offset);
        transform: rotate(180deg);
      }

      &.open {
        --translate-x: 0;
      }

      &.top,
      &.middle {
        border-bottom-right-radius: var(--border-radius);
      }

      &.bottom,
      &.middle {
        border-top-right-radius: var(--border-radius);
      }

      :global(.toolbar) {
        flex-direction: row-reverse;
      }
    }

    &.center {
      left: 50%;
      align-items: center;
      --translate-x: -50%;
    }

    &.hidden {
      opacity: 0;
    }

    &.full-y {
      top: 0;
      bottom: 0;
      flex-direction: column;
      border-top: none;
      border-bottom: none;
      border-radius: 0;
      height: 100%;

      .handle {
        top: 12px;
      }

      &.open {
        --translate-y: 0;
        --translate-x: 0;
      }
    }

    &.full-x {
      right: 0;
      left: 0;
      border-right: none;
      border-left: none;
      border-radius: 0;
      width: 100%;
    }
  }
</style>
