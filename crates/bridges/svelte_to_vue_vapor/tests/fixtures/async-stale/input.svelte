<script>
  let value = $state(1);
  const jobs = new Map();
  const work = (value) => new Promise((resolve) => jobs.set(value, () => resolve(value * 10)));
</script>
<button id="change" onclick={() => value++}>change</button>
<button id="first" onclick={() => jobs.get(1)?.()}>first</button>
<button id="second" onclick={() => jobs.get(2)?.()}>second</button>
<button id="current" onclick={() => jobs.get(value)?.()}>current</button>
<svelte:boundary>
  <p>{value}:{await work(value)}</p>
  <small>{$effect.pending()}</small>
  {#snippet pending()}<em>loading</em>{/snippet}
</svelte:boundary>
