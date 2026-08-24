<script>
  import Self from "./props-without-destructuring.svelte";

  const props = $props();

  const depth = $derived(props.depth ?? 0);
  const label = $derived(props.label ?? "l");
</script>

{#if depth === 0}
  <Self depth={1} label="a" extra={1} />
  <Self depth={1} />
{:else}
  <b>{label}{Object.keys(props).length}</b>
{/if}
