<script>
  let seed = $state(1);
  const promise = Promise.resolve(seed);
</script>

{#key seed}
  {#await promise}
    <b>pending</b>
  {:then value}
    {#each [value] as one}
      {#key one}
        <b>{one}</b>
      {/key}
    {/each}
  {:catch error}
    <b>{error}</b>
  {/await}
{/key}

{#await promise then value}
  {#if value}
    {@const doubled = value * 2}
    <b>{doubled}</b>
  {/if}
{/await}
