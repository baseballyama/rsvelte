<svelte:options runes={false} />

<script>
  import Self from "./svelte-component-dynamic.svelte";

  export let depth = 0;

  const table = { self: Self };
  let which = "self";
</script>

{#if depth === 0}
  <svelte:component this={Self} depth={1} />
  <svelte:component this={table[which]} depth={1} />
  <svelte:component this={depth === 0 ? Self : null} depth={1} />
  {#each [Self] as Dynamic}
    <svelte:component this={Dynamic} depth={1} />
  {/each}
{:else}
  <b>{depth}</b>
{/if}
