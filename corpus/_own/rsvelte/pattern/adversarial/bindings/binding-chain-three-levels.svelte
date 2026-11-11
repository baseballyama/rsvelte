<script>
  import Self from "./binding-chain-three-levels.svelte";

  let { depth = 0, value = $bindable(0) } = $props();

  let root = $state(1);
</script>

{#if depth === 0}
  <Self depth={1} bind:value={root} />
  <b>{root}</b>
{:else if depth === 1}
  <Self depth={2} bind:value />
  <b>{value}</b>
{:else if depth === 2}
  <Self depth={3} bind:value />
  <b>{value}</b>
{:else}
  <button onclick={() => (value += 1)}>{value}</button>
{/if}
