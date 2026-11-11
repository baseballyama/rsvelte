<script>
  let value = $state(1);
  async function work(value) {
    if (value === 3) throw new Error('three');
    return value * 2;
  }
</script>
<button id="change" onclick={() => value++}>change</button>
<svelte:boundary>
  <p>{value} = {await work(value)}</p>
  {#snippet pending()}<em>loading</em>{/snippet}
  {#snippet failed(error, reset)}
    <strong>{error.message}</strong>
    <button id="reset" onclick={() => { value = 1; reset(); }}>reset</button>
  {/snippet}
</svelte:boundary>
