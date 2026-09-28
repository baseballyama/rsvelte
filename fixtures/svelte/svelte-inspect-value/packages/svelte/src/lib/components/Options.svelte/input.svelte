<!--
 TODO
-->
<!-- <script lang="ts">
  import { getContext } from 'svelte'
  import { fade } from 'svelte/transition'
  import { OPTIONS_CONTEXT, type OptionsContext } from '../options.svelte.js'

  let options: OptionsContext = getContext(OPTIONS_CONTEXT)

  const themes = [
    'drak',
    'monokai',
    'default-dark',
    'default-light',
    'solarized-dark',
    'none',
    'cotton-candy',
  ]
</script>

{#if options.value.open}
  <div class="options" transition:fade>
    <div class="header" style="display: flex; justify-items: space-between;">
      <span>Options</span>
      <button
        style="margin-left: auto"
        onclick={() => (options.value.open = false)}
        aria-label="close options"
        title="close options">&times;</button
      >
    </div>

    <div class="controls">
      <label>
        show lengths
        <input type="checkbox" bind:checked={options.value.showLength} />
      </label>

      <label>
        show types
        <input type="checkbox" bind:checked={options.value.showTypes} />
      </label>

      <label>
        show preview
        <input type="checkbox" bind:checked={options.value.showPreview} />
      </label>

      <label>
        draggable
        <input type="checkbox" bind:checked={options.value.draggable} />
      </label>

      <label>
        no animations
        <input type="checkbox" bind:checked={options.value.noanimate} />
      </label>

      <label>
        collapse strings
        <input type="number" bind:value={options.value.stringCollapse} />
      </label>

      <label>
        theme
        <select bind:value={options.value.theme}>
          {#each themes as theme}
            <option>{theme}</option>
          {/each}
        </select>
      </label>

      <label>
        string quotes
        <select bind:value={options.value.quotes}>
          <option>single</option>
          <option>double</option>
        </select>
      </label>
    </div>
  </div>
{/if}

<style>
  .options {
    position: absolute;
    inset: 0.5em;
    z-index: 10;
    border-radius: 8px;
    background-color: var(--bg);
    overflow: auto;
    border: 1px solid var(--_border-color);
    max-height: max-content;
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1em;

    .header {
      width: 100%;
      display: flex;
      align-items: center;

      span {
        text-decoration: underline;
      }
    }

    button {
      font-weight: bold;
      font-size: 1.5em;
    }

    .controls {
      display: flex;
      flex-flow: row wrap;
      gap: 1em;
      overflow-y: auto;

      input,
      select {
        color: var(--fg);
        background-color: var(--bg-lighter);
        border: 1px solid var(--_border-color);
        text-align: right;
        /* padding-inline: 1em; */
      }

      input[type='number'] {
        width: 5em;
      }

      input[type='checkbox'] {
        appearance: none;
        -webkit-appearance: none;
        display: flex;
        align-content: center;
        justify-content: center;
        border: 1px solid var(--_border-color);
        border-radius: 2px;
        accent-color: var(--bg-lighter);
      }

      input[type='checkbox']::before {
        content: '';
        width: 1em;
        height: 1em;
        clip-path: polygon(28% 38%, 41% 53%, 75% 24%, 86% 38%, 40% 78%, 15% 50%);
        transform: scale(0);
        background-color: var(--fg);
        transition: all 0.1s ease-in-out;
      }

      input[type='checkbox']:checked::before {
        transform: scale(1);
      }

      input[type='checkbox']:hover {
        color: black;
      }

      label {
        display: flex;
        gap: 1em;
        align-items: center;
        justify-content: flex-start;
        padding: 0.5em;
        max-width: max-content;
        flex: 1 0 auto;
        flex-direction: row;
        flex-wrap: nowrap;
        /* align-items: flex-end; */
        color: var(--string);
        border-bottom: 1px solid var(--_border-color);
      }
    }
  }
</style> -->
