<script>
  let n = $state(0);
</script>

<svelte:boundary onerror={(error, reset) => reset()}>
  <b>{n}</b>

  {#snippet pending()}
    <b>pending</b>
  {/snippet}

  {#snippet failed(error, reset)}
    <button onclick={reset}>{error.message}</button>
  {/snippet}
</svelte:boundary>

<svelte:boundary>
  <b>{n}</b>
</svelte:boundary>

<svelte:boundary onerror={() => {}}>
  <svelte:boundary>
    <b>{n}</b>

    {#snippet failed(error)}
      <b>{error.message}</b>
    {/snippet}
  </svelte:boundary>
</svelte:boundary>
