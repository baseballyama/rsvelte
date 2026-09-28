<script lang="ts">
  import Caret from '$lib/components/icons/Caret.svelte'
  import type { Snippet } from 'svelte'

  type Props = {
    title: Snippet
    subRoutes: Snippet<[boolean]>
    expanded?: boolean
  }

  let { subRoutes, title }: Props = $props()

  let expanded = $state(false)
</script>

<button onclick={() => (expanded = !expanded)}>
  <Caret
    style="height: 1em; width: 1em; rotate: {expanded
      ? 90
      : 0}deg; transition: all 200ms ease-in-out;"
  />
  {@render title()}
</button>

{@render subRoutes(expanded)}

<style>
  button {
    all: unset;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.25em;
  }

  button:hover {
    background-color: transparent;
  }
</style>
