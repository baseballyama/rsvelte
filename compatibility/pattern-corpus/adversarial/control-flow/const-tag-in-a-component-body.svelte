<script>
  import Self from "./const-tag-in-a-component-body.svelte";

  let { depth = 0, children } = $props();

  const rows = [{ id: 1 }];
</script>

{#if depth === 0}
  <Self depth={1}>
    {@const computed = rows.length + 1}
    <b>{computed}</b>
  </Self>

  <Self depth={1}>
    {#snippet children()}
      {@const outer = rows.length}
      {@const inner = outer * 2}
      <b>{outer}{inner}</b>
    {/snippet}
  </Self>
{:else}
  {@render children?.()}
  <b>{depth}</b>
{/if}
