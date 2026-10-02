<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'

  type Props = {
    busy?: boolean
  } & HTMLButtonAttributes

  let { children, onclick, busy, disabled, ...rest }: Props = $props()

  let button = $state<HTMLButtonElement>()

  export function focus() {
    button?.focus()
  }
</script>

<button
  bind:this={button}
  type="button"
  disabled={disabled || busy}
  aria-busy={busy}
  {...rest}
  {onclick}
  ondblclick={(e) => e.stopPropagation()}
>
  {@render children?.()}
</button>

<style>
  button {
    all: unset;
    transform-origin: bottom center;
    transition:
      color 150ms,
      background-color 250ms,
      outline-color 150ms,
      transform 150ms;
    transition-timing-function: ease-in-out;
    cursor: pointer;
    outline: 1px solid var(--_button-color);
    border-radius: 2px;
    background-color: var(--_background-color);
    padding-inline: 0.5em;
    height: 1.5em;
    color: var(--_button-color);
    font-weight: normal;
    font-size: 0.8em;
    line-height: 1.5em;
    font-family: var(--inspect-font);
    user-select: none;

    &:disabled {
      cursor: default;
      outline-color: var(--_button-disabled-color);
      color: var(--_button-disabled-color);
    }

    &:active:not(:disabled) {
      transform: scaleY(0.85);
      outline: 1px solid var(--_button-color);
      background-color: var(--_background-color);
      color: var(--_button-color);
    }

    &:hover:not(:disabled):not(:active),
    &:focus-visible {
      background-color: var(--_button-color);
      color: var(--_background-color);
    }
  }
</style>
