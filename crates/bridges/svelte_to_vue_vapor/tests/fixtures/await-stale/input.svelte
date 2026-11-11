<script>
  let resolveOld;
  let promise = $state.raw(new Promise((resolve) => { resolveOld = resolve; }));
</script>
<button onclick={() => promise = Promise.resolve('fresh')}>replace</button>
<button onclick={() => resolveOld('stale')}>resolve old</button>
<button onclick={() => promise = 'plain'}>plain</button>
{#await promise}<p>pending</p>{:then value}<p>{value}</p>{:catch error}<p>{error}</p>{/await}
