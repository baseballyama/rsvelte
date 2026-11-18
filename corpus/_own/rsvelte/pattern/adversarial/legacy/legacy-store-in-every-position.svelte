<svelte:options runes={false} />

<script>
  import { writable, get } from "svelte/store";

  const count = writable(1);
  const nested = writable({ deep: [1] });

  let local = 0;

  $: doubled = $count * 2;
  $: local = $count + doubled;
  $: $count = $count;

  function write() {
    $count += 1;
    $nested.deep = [...$nested.deep, 2];
    $nested.deep[0] += 1;
    count.set(get(count) + 1);
  }
</script>

<button on:click={write} class:on={$count > 0}>{$count}</button>
<b>{doubled}{local}{$nested.deep.length}</b>
<input bind:value={$count} />

<style>
  .on {
    color: red;
  }
</style>
