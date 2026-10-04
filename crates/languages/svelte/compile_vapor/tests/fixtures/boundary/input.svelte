<script>
  let broken = $state(false);
  let reports = $state([]);
  function read() {
    if (broken) throw new Error('broken');
    return 'ready';
  }
</script>
<button onclick={() => broken = true}>break</button>
<output>{reports.join(',')}</output>
<svelte:boundary onerror={(error) => reports.push(error.message)}>
  <p>{read()}</p>
  {#snippet failed(error, reset)}
    <strong>{error.message}</strong>
    <button onclick={() => { broken = false; reset(); }}>reset</button>
  {/snippet}
</svelte:boundary>
