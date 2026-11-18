<script>
  let rows = $state([{ id: "a", v: 1 }]);
</script>

{#each rows as row}
  <b>{row.v}</b>
{/each}

{#each rows as row, i}
  <b>{i}{row.v}</b>
{/each}

{#each rows as row (row.id)}
  <b>{row.v}</b>
{/each}

{#each rows as row, i (row.id + i)}
  <b>{i}{row.v}</b>
{/each}

{#each rows as { id, v } (id)}
  <b>{id}{v}</b>
{/each}

{#each rows as row, i (i)}
  <b>{row.v}</b>
{:else}
  <b>empty</b>
{/each}

{#each { length: 2 } as _, i}
  <b>{i}</b>
{/each}
