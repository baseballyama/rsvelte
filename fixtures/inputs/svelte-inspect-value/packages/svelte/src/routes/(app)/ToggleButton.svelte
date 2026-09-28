<script lang="ts">
  import { slide } from '$lib/transition/index.js'
  import type { Snippet } from 'svelte'
  import type { SvelteHTMLElements } from 'svelte/elements'

  type Props = {
    children?: Snippet
    checked?: boolean
    duration?: number
  } & SvelteHTMLElements['button']

  let { children, duration = 400, checked = $bindable(false), ...rest }: Props = $props()
</script>

<button
  transition:slide={{ axis: 'x', duration }}
  type="button"
  class:checked
  onclick={() => (checked = !checked)}
  {...rest}
>
  {@render children?.()}
</button>

<style>
  button {
    all: unset;
    transition: all 200ms ease-in-out;
    cursor: pointer;
    outline: 1px solid #b4d455;
    border-radius: 8px;
    padding-inline: 0.5em;
    padding-block: 0.25em;
    max-height: 1.6em;
    font-size: 10px;
    line-height: 1;
    font-family: monospace;
    user-select: none;
    text-align: center;
    white-space: nowrap;
  }

  button:focus {
    outline: 1px solid lightblue;
    outline-offset: 2px;
  }

  button:hover:not(.checked) {
    background-color: transparent;
    color: white;
  }

  button.checked {
    background-color: #b4d455;
    color: black;
  }
</style>
