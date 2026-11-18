<script>
  let base = $state([1, 2]);
  let factor = $state(2);

  const scaled = $derived(base.map((value) => value * factor));
  const nested = $derived(scaled.map((value) => ({ value, half: value / 2 })));
</script>

{#each base as value, i (i)}
  {#each scaled as scale (scale)}
    {#each nested as row (row.value)}
      <b>{value}-{scale}-{row.half}</b>
    {/each}
  {/each}
{/each}

{#each nested.filter((row) => row.value > 0) as row (row.value)}
  {@const doubled = row.value * 2}
  <b>{doubled}</b>
{/each}

<button onclick={() => (factor += 1)}>{factor}</button>
