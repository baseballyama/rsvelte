<script>
  let broken = $state(typeof window !== 'undefined');
  let reports = $state([]);
  function read() {
    if (broken) throw new Error('first');
    return 'ready';
  }
</script>
<output>{reports.join(',')}</output>
<svelte:boundary onerror={(error) => reports.push(error.message)}>
  <p>{read()}</p>
  {#snippet failed(error, reset)}
    <strong>{error.message}</strong>
    <button onclick={() => { broken = false; reset(); }}>reset</button>
  {/snippet}
</svelte:boundary>
