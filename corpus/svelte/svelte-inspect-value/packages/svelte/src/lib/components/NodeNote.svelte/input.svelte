<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  type Props = {
    children?: Snippet
  } & HTMLAttributes<HTMLSpanElement>

  let { children, ...rest }: Props = $props()
</script>

<span data-testid="note" {...rest}>
  {@render children?.()}
</span>

<style>
  span {
    transition:
      color 150ms ease-in-out,
      background-color 150ms ease-in out;
    cursor: help;
    outline: 1px solid var(--_note-color);
    border-radius: 2px;
    background-color: var(--_background-color);
    padding-inline: 0.5em;
    height: 1.5em;
    color: var(--_note-color);
    font-size: 0.8em;
    line-height: 1.5em;
    font-family: var(--inspect-font);
  }
</style>
