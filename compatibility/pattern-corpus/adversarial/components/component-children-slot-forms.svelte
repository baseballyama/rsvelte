<script>
  import Self from "./component-children-slot-forms.svelte";

  let { depth = 0, children } = $props();
</script>

{#if depth === 0}
  <Self depth={1}>text child</Self>
  <Self depth={1}>{"expression child"}</Self>
  <Self depth={1}>
    {#snippet children()}
      <b>snippet child</b>
    {/snippet}
  </Self>
  <Self depth={1}></Self>
  <Self depth={1} />
  <Self depth={1}>
    <b>element child</b>
    {#if depth === 0}
      <b>conditional child</b>
    {/if}
  </Self>
{:else if children}
  {@render children()}
{:else}
  <b>no children</b>
{/if}
