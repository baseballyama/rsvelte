<script>
  let seed = $state(1);

  const promise = $derived(Promise.resolve(seed));
  const chained = $derived.by(() => promise.then((value) => value * 2));
</script>

{#await promise}
  <b>pending</b>
{:then value}
  <b>{value}</b>
{/await}

{#await chained then value}
  <b>{value}</b>
{/await}

{#key seed}
  {#await promise then value}
    <b>{value}</b>
  {/await}
{/key}

{#each [promise] as p (p)}
  {#await p then value}
    <b>{value}</b>
  {/await}
{/each}

<button onclick={() => (seed += 1)}>{seed}</button>
