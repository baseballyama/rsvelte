<svelte:options runes={false} />

<script>
  import { derived, writable } from "svelte/store";

  const count = writable(0);
  const doubled = derived(count, ($count) => $count * 2);
  const nested = writable({ list: [1] });

  export let external = writable("e");

  $: total = $count + $doubled;

  function bump() {
    $count += 1;
    $count = $count + 1;
    $nested.list = [...$nested.list, $count];
    $external = `${$external}!`;
  }
</script>

<b>{$count}{$doubled}{total}</b>
<b>{$nested.list.length}{$external}</b>
<button on:click={bump}>go</button>
