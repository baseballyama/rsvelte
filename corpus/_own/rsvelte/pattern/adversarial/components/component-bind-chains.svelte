<script>
  import Self from "./component-bind-chains.svelte";

  let {
    depth = 0,
    value = $bindable(0),
    nested = $bindable({ deep: 0 }),
  } = $props();

  let outer = $state(1);
  let outerNested = $state({ deep: 2 });
  let instance = $state(null);
</script>

{#if depth === 0}
  <Self
    depth={1}
    bind:value={outer}
    bind:nested={outerNested}
    bind:this={instance}
  />
  <Self depth={1} bind:value={outerNested.deep} />
  <b>{outer}{outerNested.deep}{instance ? 1 : 0}</b>
{:else}
  <button onclick={() => (value += 1)}>{value}{nested.deep}</button>
{/if}
