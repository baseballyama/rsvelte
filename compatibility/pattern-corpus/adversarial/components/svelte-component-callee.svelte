<script>
  import Self from "./svelte-component-callee.svelte";

  let { depth = 0 } = $props();

  const table = { Self };
  const chosen = $derived(depth === 0 ? Self : null);
  let dynamic = $state(Self);
</script>

{#if depth === 0}
  <svelte:component this={Self} depth={1} />
  <svelte:component this={table.Self} depth={1} />
  <svelte:component this={chosen} depth={1} />
  <svelte:component this={dynamic} depth={1} />
  <svelte:component this={depth === 0 ? Self : null} depth={1} />
{:else}
  <b>leaf</b>
{/if}
