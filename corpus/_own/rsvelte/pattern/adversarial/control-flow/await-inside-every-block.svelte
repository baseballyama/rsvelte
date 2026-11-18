<script>
  let rows = $state([1]);
  let flag = $state(true);
  const make = (n) => Promise.resolve(n);
</script>

{#if flag}
  {#await make(1) then a}
    <b>{a}</b>
  {/await}
{/if}

{#each rows as row}
  {#await make(row) then a}
    <b>{a}</b>
  {/await}
{/each}

{#key flag}
  {#await make(2) then a}
    <b>{a}</b>
  {/await}
{/key}

{#await make(3) then outer}
  {#await make(outer) then inner}
    <b>{inner}</b>
  {/await}
{/await}

{#snippet body(value)}
  {#await make(value) then a}
    <b>{a}</b>
  {/await}
{/snippet}

{@render body(4)}
