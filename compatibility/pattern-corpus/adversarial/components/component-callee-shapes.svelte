<script>
  import Self from "./component-callee-shapes.svelte";

  let { depth = 0 } = $props();

  const table = { Self };
  const namespaced = { Inner: { Self } };
  const chosen = $derived(depth > 0 ? Self : null);
</script>

{#if depth < 1}
  <Self depth={depth + 1} />
  <table.Self depth={depth + 1} />
  <namespaced.Inner.Self depth={depth + 1} />
  <svelte:self depth={depth + 1} />
{:else if chosen}
  <b>leaf</b>
{/if}
