<script>
  import Self from "./component-attribute-and-children-mix.svelte";

  let { depth = 0, children } = $props();
  const next = $derived(depth + 1);
</script>

{#if depth < 2}
  <Self depth={next}>
    {#snippet children()}
      <b>{next}</b>
    {/snippet}
  </Self>
{:else if children}
  {@render children()}
{:else}
  <b>leaf {depth}</b>
{/if}
