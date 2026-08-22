<svelte:options runes={false} />

<script>
  import { writable } from "svelte/store";

  const rows = writable([{ id: 1, n: 0 }]);

  function bump(id) {
    rows.update((list) =>
      list.map((row) => (row.id === id ? { ...row, n: row.n + 1 } : row)),
    );
  }
</script>

{#each $rows as row (row.id)}
  <button on:click={() => bump(row.id)}>{row.id}:{row.n}</button>
{:else}
  <b>empty</b>
{/each}

<b>{$rows.length}</b>
