<script>
  import Self from "./dotted-component-names.svelte";

  let { depth = 0 } = $props();

  const ns = { Sub: Self, deep: { Sub: Self } };
</script>

{#if depth === 0}
  <ns.Sub depth={1} />
  <ns.deep.Sub depth={1} />
  <svelte:component this={ns.Sub} depth={1} />
{:else}
  <b>{depth}</b>
{/if}
