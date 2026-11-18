<script>
  let broken = $state(false);
  let reports = $state([]);
  function read() {
    if (broken) throw new Error('inner');
    return 'ready';
  }
  function report(error) {
    reports.push(error.message);
    throw new Error('outer');
  }
</script>
<button onclick={() => broken = true}>break</button>
<output>{reports.join(',')}</output>
<svelte:boundary>
  <svelte:boundary onerror={report}>
    <p>{read()}</p>
    {#snippet failed(error)}<em>{error.message}</em>{/snippet}
  </svelte:boundary>
  {#snippet failed(error, reset)}
    <strong>{error.message}</strong>
    <button onclick={() => { broken = false; reset(); }}>reset</button>
  {/snippet}
</svelte:boundary>
