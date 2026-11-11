<script>
  import Self from "./component-bind-shorthand.svelte";

  let { depth = 0, value = $bindable(0), label = $bindable("l") } = $props();

  let inner = $state(1);
</script>

{#if depth === 0}
  <Self depth={1} bind:value bind:label />
  <Self depth={1} bind:value={inner} bind:label />
  <b>{value}{label}{inner}</b>
{:else}
  <button onclick={() => (value += 1)}>{value}</button>
  <button onclick={() => (label += "!")}>{label}</button>
{/if}
