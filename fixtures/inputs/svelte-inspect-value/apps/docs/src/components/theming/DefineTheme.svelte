<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  // import Console from '$lib/components/icons/Console.svelte'
  import { Inspect } from '@components'
  import { StateHistory } from 'runed'
  import ColorPicker from 'svelte-awesome-color-picker'

  import { themes } from './themes.js'
  import Theming from './Theming.svelte'
  import { onMount } from 'svelte'

  let visible = $state(false)

  onMount(() => {
    let tim = setTimeout(() => {
      visible = true
    }, 600)

    return () => {
      clearTimeout(tim)
    }
  })

  let presets = Object.keys(themes) as (keyof typeof themes)[]
  let selectedPreset = $state<keyof typeof themes>('inspect')
  let preset = $state<keyof typeof themes>('inspect')
  let panel = $state(false)
  let backgroundColor = $state('#808080')
  let borderless = $state(false)
  let font = $state('monospace')
  let fontSize = $state(12)
  let fontSizePx = $derived(fontSize + 'px')
  let indent = $state(0.75)
  let colors = $state({ ...themes.inspect })

  let keys = $derived(Object.keys(colors) as (keyof typeof colors)[])
  let pickerOpen = $state<Record<keyof typeof colors, boolean>>(
    Object.fromEntries(keys.map((k) => [k, false])) as Record<keyof typeof colors, boolean>
  )
  let historySrc = $state({
    colors: { ...themes.inspect },
  })
  const history = new StateHistory(
    () => ({ ...historySrc }),
    (entry) => {
      colors = { ...entry.colors }
      // selectedPreset = entry.selectedPreset
    }
  )

  let style = $derived.by(() => {
    return keys.map((k) => `${k}: ${colors[k]};`).join('') + 'flex-basis: 100%;'
  })

  let wroteToHistoryOnce = false
  $effect(() => {
    if (Object.values(pickerOpen).every((v) => v === false)) {
      if (wroteToHistoryOnce) {
        historySrc.colors = { ...colors }
      }
      wroteToHistoryOnce = true
    }
  })

  function loadPreset() {
    applyColors({ ...themes[selectedPreset] })
  }

  function applyColors(newColors: typeof colors) {
    colors = Object.fromEntries(
      keys.map((k) => {
        return [k, newColors[k]]
      })
    ) as typeof colors
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link
    href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Fira+Code:wght@300..700&family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=Inconsolata:wght@200..900&family=Reddit+Mono:wght@200..900&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&family=Ubuntu+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="controls">
  <div class="sub-controls">
    <label class="preset-loader">
      Presets
      <select bind:value={selectedPreset}>
        {#each presets as preset (preset)}
          <option value={preset}>{preset}</option>
        {/each}
      </select>
    </label>
    <button onclick={loadPreset}> Load </button>
  </div>

  <label>
    Background
    <select bind:value={backgroundColor}>
      <option value="#f2f2f2">bright</option>
      <option value="#808080">neutral</option>
      <option value="#111">dark</option>
    </select>
  </label>
  <div class="sub-controls">
    <label>
      Panel
      <input type="checkbox" bind:checked={panel} />
    </label>
    <label>
      Borderless
      <input type="checkbox" bind:checked={borderless} />
    </label>
  </div>
</div>

<div style:opacity={visible ? '1' : '0'} class="colors-and-preview">
  <Theming
    --preview-bg={backgroundColor}
    --indent="{indent}em"
    --inspect-font={font}
    --inspect-font-size={fontSizePx}
    {borderless}
    {panel}
    {colors}
    {style}
  />
  <div class="colors not-content">
    {#each keys as key}
      <div class="dark-picker">
        <ColorPicker
          hex={colors[key]}
          onInput={(color) => {
            colors = { ...colors, [key]: color.hex }
          }}
          bind:isOpen={pickerOpen[key]}
          label={key.replaceAll('--base', '')}
          dir="rtl"
        />
      </div>
    {/each}
  </div>
</div>

<div class="controls">
  <label>
    Indent (em)
    <input type="number" style="max-width: 6em" step={0.125} bind:value={indent} />
  </label>
  <label>
    Font
    <select bind:value={font}>
      <option value="monospace">monospace (system)</option>
      <option>Roboto Mono</option>
      <option>Inconsolata</option>
      <option>Source Code Pro</option>
      <option>IBM Plex Mono</option>
      <option>Courier Prime</option>
      <option>Ubuntu Mono</option>
      <option>Fira Code</option>
      <option>Reddit Mono</option>
      <option disabled>Local install required:</option>
      <option>Consolas</option>
      <option>Pixel Code</option>
      <option>Dank Mono</option>
      <option>Andale Mono</option>
    </select>
  </label>
  <label>
    Font size
    <input type="number" style="max-width: 6em" bind:value={fontSize} />
  </label>
  <button
    title="Output theme object to console"
    style="width: 2em; height: 2em;"
    onclick={() => {
      // eslint-disable-next-line no-console
      console.log($state.snapshot(colors))
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 19h8M4 17l6-6l-6-6"
      />
    </svg>
  </button>

  <button disabled={!history.canUndo} onclick={() => history.undo()}>Undo</button>
  <button disabled={!history.canRedo} onclick={() => history.redo()}>Redo</button>
</div>

<Inspect values={{ style, history: history.log.map((h) => h.snapshot) }} />

<h2 id="defining-a-theme">Defining a theme</h2>

<p>
  Add your custom theme class to a global css file and import it, then set the theme-class using the
  class or theme-prop on the inspect component or via global options.
</p>

<pre>
<span class="selector">.my-inspect-theme</span> {'{'}
{#each keys as key, i (key)}<span class="key">{key}</span>: <span class="value">{colors[key]}</span
    >;{#if i !== 15}<br />{/if}{/each}
{'}'}</pre>
<p>Alternatively, set css variables directly on the component.</p>
<pre>
{'<'}<span style="color:var(--blue);">Inspect</span>
  <span style="color: var(--green)">theme</span>=""
{#each keys as key, i (key)}<span class="value" style="padding-left: 1em;">{key}</span>=<span
      style="color: var(--yellow);">"{colors[key]}"</span
    >{#if i !== 15}<br />{/if}{/each}
{'/>'}
</pre>

<em>Note: these code blocks are updated with colors set in the theme editor above</em>

<h2 id="extended-theming">Extended customization</h2>

<p>
  Behind the scenes, the base16 theme is mapped to internal CSS-variables. This mapping can be
  overriden by setting additional CSS-variables on your custom theme class or passing them to the
  component.<br />
  See the <a href="/theming/vars">full overview</a> of available css-variables than can be passed to
  <code>Inspect</code>.
</p>

<pre>
{'<'}<span style="color:var(--blue);">Inspect</span>
<span style="padding-left: 1em;color: var(--green);">theme</span>=<span
    style="color: var(--yellow);">"inspect"</span
  >
<span style="padding-left: 1em;color: var(--green);">value</span>=<span
    style="color: var(--yellow);">{'{'}...{'}'}</span
  >
<span class="value" style="padding-left: 1em;">--inspect-background</span>=<span
    style="color: var(--yellow);">"linear-gradient(45deg, var(--base00) 50%, hotpink)"</span
  >
<span class="value" style="padding-left: 1em;">--caret-color</span>=<span
    style="color: var(--yellow);">"#b4da55"</span
  >
<span class="value" style="padding-left: 1em;">--caret-focus-color</span>=<span
    style="color: var(--yellow);">"hotpink"</span
  >
<span class="value" style="padding-left: 1em;">--bullet-color</span>=<span
    style="color: var(--yellow);">"hotpink"</span
  >
<span class="value" style="padding-left: 1em;">--string-value-color</span>=<span
    style="color: var(--yellow);">"var(--base08)"</span
  >
{'/>'}
</pre>

Result:
<Inspect
  theme="inspect"
  --inspect-background="linear-gradient(45deg, var(--base00) 50%, hotpink)"
  --text-color="var(--base05)"
  --caret-color="#b4da55"
  --caret-focus-color="hotpink"
  --bullet-color="hotpink"
  --string-value-color="var(--base08)"
  value={{
    test: 'lorem ipsum dolor sit amet',
  }}
/>

<style>
  .preset-loader {
    display: flex;
    flex-direction: column;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-end;
    gap: 0.5em;
    margin-top: 0;
    margin-inline: auto;
    border-radius: 8px;
    background-color: var(--sl-color-gray-5);
    padding: 0.5em;
    max-width: fit-content;

    & > :not(:last-child):not(button) {
      border-right: 1px solid var(--sl-color-gray-3);
    }

    button {
      margin-right: 0.5em;
      height: 2em;
      font-family: system-ui;
    }

    label {
      display: flex;
      flex-direction: column;
      margin: 0;
      padding-right: 0.5em;
      font-size: 12px;
      font-family: monospace;

      input,
      select {
        padding: 2px;
        height: 32px;
      }
    }

    label:has(input[type='checkbox']) {
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }
  }

  .sub-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-end;
    gap: 0.5em;
    margin-top: 0;
  }

  .colors-and-preview {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    transition: opacity 500ms;
    margin-block: 0.5em;
  }

  .colors {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background-color: var(--sl-color-gray-5);
    height: max-content;
  }

  /* @media (min-width: 1024px) {
    .colors-and-preview {
      flex-direction: row;
      justify-content: center;
      gap: 1em;
      margin-left: 1em;
    }

    .colors {
      flex-direction: column;
      justify-content: space-between;
    }

    label.color {
      flex-direction: row;
      gap: 1em;
    }
  } */

  /* .colorpicker {
    position: relative;
    outline: 1px solid white;
    border-radius: 4px;
    width: 3.5em;
    height: 2em;
    overflow: hidden;
  } */

  /* input[type='color'] {
    cursor: pointer;
    margin: 0;
    border: none;
    border-color: var(--base03, black);
    background-color: transparent;
    padding: 0;
    aspect-ratio: 1 / 1;
  } */

  pre {
    border: 1px solid var(--docs-border-color);
    border-radius: 8px;
    background-color: var(--bg);
    padding: 1em;
    overflow-x: auto;
    font-size: 12px;

    .key {
      padding-left: 1em;
      color: var(--base05);
    }

    .selector {
      color: var(--green);
    }

    .value {
      color: var(--blue);
    }
  }

  .dark-picker {
    font-family: monospace;
    --cp-bg-color: var(--base01);
    --cp-border-color: var(--base03);
    --cp-text-color: var(--base05);
    --cp-input-color: var(--base02);
    --cp-button-hover-color: var(--base03);
    --picker-z-index: 9999;
  }
</style>
