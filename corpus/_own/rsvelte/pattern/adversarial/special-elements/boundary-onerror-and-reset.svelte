<script>
  let n = $state(0);

  function handle(error, reset) {
    n += 1;
    reset();
  }
</script>

<svelte:boundary onerror={handle}>
  <b>a</b>
</svelte:boundary>

<svelte:boundary onerror={(error, reset) => reset()}>
  <b>b</b>

  {#snippet failed(error, reset)}
    <button onclick={reset}>{String(error)}</button>
  {/snippet}
</svelte:boundary>

<svelte:boundary>
  {#snippet pending()}
    <b>pending</b>
  {/snippet}

  <b>c</b>
</svelte:boundary>

<svelte:boundary onerror={handle}>
  {#snippet failed(error)}
    <b>{String(error)}</b>
  {/snippet}

  <svelte:boundary>
    <b>nested</b>
  </svelte:boundary>
</svelte:boundary>

<b>{n}</b>
