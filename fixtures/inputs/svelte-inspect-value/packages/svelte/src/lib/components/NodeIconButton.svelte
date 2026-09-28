<script lang="ts">
  import { useOptions } from '../options.svelte.js'
  import type { Snippet } from 'svelte'
  import type { SvelteHTMLElements } from 'svelte/elements'
  import { slide, type SlideParams } from '../transition/index.js'

  type Props = {
    children: Snippet
    success?: boolean
    transition?: typeof slide
    transitionParams?: SlideParams
  } & SvelteHTMLElements['button']

  const options = useOptions()
  let {
    children,
    success = false,
    transition = slide,
    transitionParams = { axis: 'x', duration: options.transitionDuration },
    ...rest
  }: Props = $props()

  let button = $state<HTMLButtonElement>()

  export function focus() {
    button?.focus()
  }
</script>

<button
  class="node-icon-button"
  transition:transition={{ duration: options.transitionDuration, ...transitionParams }}
  bind:this={button}
  class:success
  type="button"
  {...rest}
>
  {@render children?.()}
</button>

<style>
  :global(.node-icon-button svg) {
    min-width: 1.5em;
    min-height: 1.5em;
  }

  .node-icon-button {
    all: unset;
    transform-origin: bottom center;
    transition:
      color 250ms ease-in-out,
      background-color 250ms ease-in-out,
      transform 100ms ease-in-out;
    cursor: pointer;
    width: 1.5em;
    min-width: 1.5em;
    height: 1.5em;
    color: var(--_button-color);
    font-size: 1em;
    line-height: 1.5em;
    font-family: var(--inspect-font);
    text-align: center;

    &.success {
      color: var(--_button-success-color) !important;
    }

    &:disabled {
      cursor: default;
      color: var(--_button-disabled-color) !important;
    }

    &:active:not(:disabled) {
      transform: scaleY(0.85);
      background-color: transparent;
      color: var(--_button-color);
    }

    &:hover:not(:disabled):not(:active),
    &:focus-visible {
      background-color: transparent;
      color: var(--_text-color);
    }
  }
</style>
