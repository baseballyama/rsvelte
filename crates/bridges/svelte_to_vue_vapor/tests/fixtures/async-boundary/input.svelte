<script>
  let value = $state(1);
  let jobs = [];
  const work = (value) => new Promise((resolve) => jobs.push(() => resolve(value * 2)));
  const finish = () => jobs.splice(0).forEach((resolve) => resolve());
</script>
<button id="finish" onclick={finish}>finish</button>
<button id="change" onclick={() => value++}>change</button>
<svelte:boundary>
  <p>{value} = {await work(value)}</p>
  <small>{$effect.pending()}</small>
  {#snippet pending()}<em>loading</em>{/snippet}
</svelte:boundary>
