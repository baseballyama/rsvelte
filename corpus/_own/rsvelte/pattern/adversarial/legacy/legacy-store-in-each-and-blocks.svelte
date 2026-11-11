<svelte:options runes={false} />

<script>
  import { derived, writable } from "svelte/store";

  const rows = writable([1, 2]);
  const flag = writable(true);
  const total = derived(rows, ($rows) => $rows.length);

  function bump() {
    rows.update((list) => [...list, list.length + 1]);
  }
</script>

{#each $rows as row (row)}
  <b>{row}{$total}</b>
{/each}

{#if $flag}
  <b>{$total}</b>
{:else}
  <b>0</b>
{/if}

{#key $flag}
  <b>{$rows.length}</b>
{/key}

{#await Promise.resolve($total) then value}
  <b>{value}</b>
{/await}

<button on:click={bump}>{$total}</button>
