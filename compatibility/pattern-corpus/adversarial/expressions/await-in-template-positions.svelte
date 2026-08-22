<script>
  let rows = $state([1]);
  let flag = $state(true);
</script>

{#each rows as row}
  <b>{row}</b>
{/each}

{#if flag}
  <b>{rows.length}</b>
{/if}

{#key flag}
  <b>{rows[0]}</b>
{/key}

{#await Promise.resolve(rows) then loaded}
  {#each loaded as item}
    <b>{item}</b>
  {/each}
{/await}
