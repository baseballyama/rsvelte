<script>
  import Self from "./bindable-prop-write-shapes.svelte";

  let {
    depth = 0,
    count = $bindable(0),
    holder = $bindable({ deep: { n: 0 }, list: [0] }),
  } = $props();

  let localCount = $state(0);
  let localHolder = $state({ deep: { n: 0 }, list: [0] });

  function write() {
    count += 1;
    count++;
    holder.deep.n += 1;
    holder.list[0] += 1;
    holder.list = [...holder.list, 1];
    holder = { ...holder };
  }
</script>

{#if depth === 0}
  <Self depth={1} bind:count={localCount} bind:holder={localHolder} />
  <b>{localCount}{localHolder.deep.n}{localHolder.list.length}</b>
{:else}
  <button onclick={write}>{count}{holder.deep.n}{holder.list[0]}</button>
{/if}
