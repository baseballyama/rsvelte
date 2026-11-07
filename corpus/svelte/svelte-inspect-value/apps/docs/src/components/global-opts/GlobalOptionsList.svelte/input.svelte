<script module lang="ts">
  import { globalOpts, panelState, setGlobalOpts } from './globalopts.svelte'

  export function scrollTo(id: string) {
    if (!panelState.ele) return
    const wasOpen = panelState.keepOpen
    panelState.keepOpen = true
    const input = panelState.ele?.querySelector(id) as HTMLInputElement
    if (!input) return
    // input.focus()
    input.classList.add('focused')
    input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => {
      input.classList.remove('focused')
      panelState.keepOpen = wasOpen
    }, 3000)
  }
</script>

<script lang="ts">
  import { starlightTheme } from './sltheme.svelte.js'
  import { DEFAULT_OPTIONS } from 'svelte-inspect-value'
  import * as easings from 'svelte/easing'

  import { slide } from 'svelte/transition'
  import OptionToggle from './OptionToggleCheck.svelte'
  import { onMount } from 'svelte'

  let { visible }: { visible: boolean } = $props()
  let currentTheme: 'dark' | 'light' | undefined = undefined
  let bodyEle = $state<HTMLDivElement>()

  $effect(() => {
    if (bodyEle) {
      panelState.ele = bodyEle
    }
  })

  onMount(() => {
    const doc = document.documentElement
    if ('theme' in doc.dataset) {
      starlightTheme.current = doc.dataset['theme'] as 'dark' | 'light'
    }
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.type === 'attributes' && m.target instanceof HTMLElement) {
          const dataSet = m.target.dataset
          if ('theme' in dataSet && currentTheme !== dataSet['theme']) {
            if (dataSet['theme'] === 'dark') {
              globalOpts.theme = 'inspect'
              starlightTheme.current = 'dark'
            } else {
              globalOpts.theme = 'light'
              starlightTheme.current = 'light'
            }
            currentTheme = dataSet['theme'] as 'dark' | 'light'
          }
        }
      })
    })
    observer.observe(doc, { attributes: true })

    return () => {
      observer.disconnect()
    }
  })
</script>

{#if visible}
  <div
    id="global-opts"
    transition:slide={{ duration: 300 }}
    class={['global-options not-content', panelState.keepOpen && 'keep-open']}
  >
    <div class="options-title">
      <div class="tool-buttons">
        <button
          title="Keep Open"
          class={['tool-button', 'pin-button', panelState.keepOpen ? 'keep-open' : '']}
          onclick={() => {
            panelState.keepOpen = !panelState.keepOpen
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z" />
          </svg>
        </button>
        <button
          title="Reset Settings"
          class="tool-button"
          onclick={() => {
            setGlobalOpts(DEFAULT_OPTIONS)
            if (starlightTheme.current === 'dark') {
              globalOpts.theme = 'inspect'
            } else {
              globalOpts.theme = 'light'
            }
          }}
        >
          <svg
            style="margin-left: 1px"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M2 12a9 9 0 0 0 9 9c2.39 0 4.68-.94 6.4-2.6l-1.5-1.5A6.7 6.7 0 0 1 11 19c-6.24 0-9.36-7.54-4.95-11.95S18 5.77 18 12h-3l4 4h.1l3.9-4h-3a9 9 0 0 0-18 0"
            />
          </svg>
        </button>
      </div>
      <span style="text-align: left; width: 100%; margin-left: 1.5rem;">Global Options</span>
      <a href="/api/type-aliases/inspectoptions" style="text-decoration: none;"> docs </a>
    </div>
    <div class="go-body" id="global-opts-body" bind:this={bodyEle}>
      <label>
        theme
        <select bind:value={globalOpts.theme} name="theme">
          <option>inspect</option>
          <option>drak</option>
          <option>stereo</option>
          <option>dark</option>
          <option>light</option>
          <option>plain</option>
        </select>
      </label>
      <OptionToggle key="borderless">borderless</OptionToggle>

      <OptionToggle key="parseJson" title="parse json strings">parse json</OptionToggle>
      <OptionToggle key="noanimate" title="disable animation">noanimate</OptionToggle>
      <OptionToggle key="showTypes" title="show types">types</OptionToggle>
      <OptionToggle key="showLength" title="show lengths / number of entries">lengths</OptionToggle>
      <OptionToggle key="showTools" title="show tools on row hover">tools</OptionToggle>
      <OptionToggle key="showPreview" title="enable entry previews">preview</OptionToggle>

      <label>
        preview depth
        <input
          type="number"
          bind:value={globalOpts.previewDepth}
          disabled={!globalOpts.showPreview}
          min="0"
          name="preview-depth"
        />
      </label>
      <label>
        preview entries
        <input
          type="number"
          bind:value={globalOpts.previewEntries}
          disabled={!globalOpts.showPreview}
          min="0"
          name="preview-entries"
        />
      </label>

      <label title="animation rate">
        anim rate
        <input
          type="number"
          bind:value={globalOpts.animRate}
          min="0.1"
          max="10"
          step={0.1}
          name="animation-rate"
        />
      </label>
      <label title="easing">
        easing
        <select bind:value={globalOpts.easing}>
          {#each Object.keys(easings) as easing}
            <option value={easings[easing as keyof typeof easings]}>{easing}</option>
          {/each}
        </select>
      </label>
      <OptionToggle
        key="flashOnUpdate"
        title="enable node indicators flashing when value is updated"
      >
        flash on update
      </OptionToggle>

      <label>
        string quotes
        <select bind:value={globalOpts.quotes} name="quotes">
          <option>single</option>
          <option>double</option>
          <option>none</option>
        </select>
      </label>
      <label>
        collapse strings
        <input
          type="number"
          bind:value={globalOpts.stringCollapse}
          min="0"
          name="collapse-strings"
        />
      </label>

      <label>
        search
        <select bind:value={globalOpts.search} name="search">
          <option value={false}>off</option>
          <option>highlight</option>
          <option>filter</option>
          <option>filter-strict</option>
        </select>
      </label>

      <OptionToggle disabled={!globalOpts.search} key="highlightMatches" title="highlight matches">
        highlight matches
      </OptionToggle>
    </div>
  </div>
{/if}

<style>
  .global-options {
    --title-height: 3rem;
    display: flex;
    position: fixed;
    right: 2rem;
    bottom: 0;
    flex-direction: column;
    transform: translateY(calc(100% - var(--title-height)));
    opacity: 0.5;
    z-index: 9999;
    transition-duration: 0.3s;
    transition-property: transform, opacity, border, border-color, box-shadow;
    transition-timing-function: ease;
    margin-inline: auto;
    box-shadow: 0.1rem 0.1rem 0.2rem #00000028;
    border: 1px solid var(--sl-color-gray-4);
    border-bottom: none;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    background-color: var(--sl-color-gray-6);

    width: 20rem;
    /* height: 30px; */
    overflow: hidden;
    color: var(--sl-color-white);
    font-size: 14px;

    .options-title {
      font-size: 16px;
    }

    &:focus-within {
      box-shadow:
        0.1rem 0.1rem 0.2rem var(--sl-color-accent),
        -0.1rem -0.1rem 0.2rem var(--sl-color-accent);
    }

    &.keep-open,
    &:hover,
    &:focus-within {
      transform: translateY(0);
      opacity: 1;
      /* border-color: var(--sl-color-gray-4); */
      /* height: 320px; */
      /* overflow: auto; */

      a {
        opacity: 1;
      }
    }
  }

  @media screen and (min-width: 800px) {
    .global-options {
      width: 18rem;
      /* height: 26px; */
      font-size: 12px;

      .options-title {
        font-size: 16px;
      }
    }
  }

  :global(.go-body label) {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.5em 1em;
    width: 100%;
    overflow: visible;
    font-size: inherit !important;
    text-wrap: nowrap;
  }

  input[type='number'],
  select {
    /* outline: 1px solid var(--sl-color-accent-high); */
    /* border: none; */
    /* border-radius: 8px; */
    /* background-color: transparent; */
    width: 105px;
    height: 1.5em;
    font-size: inherit !important;
    text-align: center;
  }

  .options-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--sl-color-gray-4);
    /* background-color: var(--sl-color-gray-); */
    padding-inline: 0.5rem;
    padding-block: 0.25rem;
    width: 100%;
    height: var(--title-height);
    font-weight: bold;
    font-size: 28px;
    /* font-family: monospace; */

    a {
      opacity: 0;
      transition: opacity, 0.5s;
    }
  }

  .tool-buttons {
    display: flex;
    gap: 0.25rem;
  }

  .go-body {
    display: flex;
    flex-flow: column nowrap;
    background: linear-gradient(to top, rgb(0 0 0 / 0.4), transparent 30%);
    background-attachment: local;
    height: 320px;
    overflow-y: scroll;
    font-family: monospace;
  }

  :global(.go-body > :not(:last-child)) {
    border-bottom: 1px solid var(--sl-color-gray-5);
  }

  .tool-button {
    all: unset;
    display: flex;
    justify-content: center;
    align-items: center;
    transition-duration: 300ms;
    transition-property: color, background-color;
    transition-timing-function: ease-out;
    cursor: pointer;
    outline: 1px solid var(--sl-color-gray-4);
    border-radius: 9999px;
    width: 24px;
    height: 24px;
    /* color: var(--sl-color-accent-high); */

    &:hover {
      background-color: var(--sl-color-accent-high);
      color: var(--sl-color-gray-6);
    }

    &:focus {
      outline: 1px solid var(--sl-color-accent-high);
    }
  }

  .pin-button {
    svg {
      transform: rotate(60deg) translate(0, -2px) scale(0.8);
      /* color: currentColor; */
      transition: transform 300ms ease-out;
    }

    &.keep-open {
      svg {
        transform: translate(0, 0) rotate(0) scale(1);
      }
    }
  }
</style>
