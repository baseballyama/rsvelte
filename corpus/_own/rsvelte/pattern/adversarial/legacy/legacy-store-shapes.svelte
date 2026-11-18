<svelte:options runes={false} />

<script>
  import { writable, derived, readable } from "svelte/store";

  const count = writable(0);
  const doubled = derived(count, ($count) => $count * 2);
  const ticker = readable(0, () => () => {});
  const nested = writable({ deep: { value: 1 } });

  function bump() {
    count.update((n) => n + 1);
    $count = $count;
    $nested.deep.value += 1;
  }
</script>

<button on:click={bump}>b</button>
<b>{$count}{$doubled}{$ticker}{$nested.deep.value}</b>
