<script lang="ts">
  import type { InspectOptions } from '$lib/options.svelte.js'
  import ToggleButton from './ToggleButton.svelte'

  let {
    options = $bindable(),
    onreset = () => {},
  }: { options: Partial<InspectOptions>; onreset: () => void } = $props()
</script>

<div class="options">
  <div class="options-title">
    global options (<a href="/docs/types/InspectOptions" style="text-decoration: none;">docs</a>)
  </div>

  <button class="reset-button" onclick={onreset}> reset </button>

  <label style="flex-basis: 100%; margin-top: 1ch">
    theme
    <select bind:value={options.theme} name="theme" style="width: 100%">
      <option>inspect</option>
      <option>drak</option>
      <option>stereo</option>
      <option>dark</option>
      <option>light</option>
      <option>plain</option>
    </select>
  </label>

  <ToggleButton bind:checked={options.showLength}>lengths</ToggleButton>

  <ToggleButton bind:checked={options.showTypes}>types</ToggleButton>

  <ToggleButton bind:checked={options.showTools}>tools</ToggleButton>

  <ToggleButton bind:checked={options.showPreview}>previews</ToggleButton>

  <ToggleButton bind:checked={options.noanimate}>noanimate</ToggleButton>

  <ToggleButton bind:checked={options.heading as boolean}>heading</ToggleButton>

  <ToggleButton bind:checked={options.borderless}>borderless</ToggleButton>

  <ToggleButton bind:checked={options.flashOnUpdate}>flash on update</ToggleButton>

  <ToggleButton bind:checked={options.embedMedia}>embed media</ToggleButton>

  <ToggleButton bind:checked={options.parseJson}>parse json</ToggleButton>

  <label title="animation rate">
    anim rate
    <input
      type="number"
      bind:value={options.animRate}
      min="0.1"
      max="10"
      step={0.1}
      style="width: 5em"
      name="animation-rate"
    />
  </label>

  <label>
    store
    <select bind:value={options.stores} name="stores">
      <option>full</option>
      <option value="value-only">value only</option>
      <option value={false}>off</option>
    </select>
  </label>

  <label>
    elementview
    <select bind:value={options.elementView} name="element-view">
      <option>simple</option>
      <option>full</option>
    </select>
  </label>

  <label>
    quotes
    <select bind:value={options.quotes} name="quotes">
      <option>single</option>
      <option>double</option>
      <option>none</option>
    </select>
  </label>

  <label>
    collapse strings
    <input
      type="number"
      bind:value={options.stringCollapse}
      min="0"
      style="width: 5em"
      name="collapse-strings"
    />
  </label>

  <label>
    preview depth
    <input
      type="number"
      bind:value={options.previewDepth}
      min="0"
      style="width: 5em"
      name="preview-depth"
    />
  </label>
  <label>
    preview entries
    <input
      type="number"
      bind:value={options.previewEntries}
      min="0"
      style="width: 5em"
      name="preview-entries"
    />
  </label>

  <label>
    search
    <select bind:value={options.search} name="search">
      <option value={false}>off</option>
      <option>highlight</option>
      <option>filter</option>
      <option>filter-strict</option>
    </select>
  </label>

  {#if options.search}
    <ToggleButton bind:checked={options.highlightMatches}>highlight</ToggleButton>
  {/if}
</div>

<style>
  .options {
    display: flex;
    position: relative;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 0.75em;
    z-index: 10;
    transition: height 0.3s;
    margin-top: 1em;
    border: 1px solid var(--_border-color);
    border-radius: 8px;
    background-color: var(--_background-color);
    padding: 1em;
    padding-top: 2em;
    width: 100%;
    max-width: 500px;
    height: 300px;
    overflow: auto;
    color: var(--_text-color);
    font-size: 10px;

    &:hover,
    &:focus-within {
      /* height: auto; */
      height: calc-size(auto, size);
    }
  }

  .options-title {
    position: absolute;
    top: 0.75em;
    border: 1px solid var(--_border-color);
    border-radius: 8px;
    background-color: var(--_background-color);
    padding-inline: 1ch;
    font-family: monospace;
    text-align: center;
  }

  .reset-button {
    all: unset;
    position: absolute;
    top: 0.75em;
    right: 0.5em;
    border: 1px solid var(--_border-color);
    border-radius: 8px;
    background-color: var(--_background-color);
    padding-inline: 1ch;
    font-family: monospace;
    text-align: center;
  }

  label {
    text-align: right;
  }

  label:has(input:checked) {
    background-color: #b4d455;
    color: black;
  }

  input[type='number'],
  select {
    max-height: 1.5em;
  }

  label:has(input[type='number']),
  label:has(select) {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  label {
    flex-shrink: 0;
    font-size: 10px;
    font-family: monospace;
    white-space: nowrap;
  }
</style>
