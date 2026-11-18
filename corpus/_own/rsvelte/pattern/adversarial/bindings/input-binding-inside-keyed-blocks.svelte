<script>
  let rows = $state([{ id: 1, value: "a", on: true }]);
  let show = $state(true);
</script>

{#if show}
  {#each rows as row (row.id)}
    {#if row.on}
      <input bind:value={row.value} />
      <input type="checkbox" bind:checked={row.on} />
    {/if}

    {#key row.value}
      <input bind:value={row.value} />
    {/key}
  {/each}
{/if}

{#each rows as row, i (row.id)}
  {#if i >= 0}
    <textarea bind:value={rows[i].value}></textarea>
  {/if}
{/each}

<b>{rows[0].value}{rows[0].on}{show}</b>
