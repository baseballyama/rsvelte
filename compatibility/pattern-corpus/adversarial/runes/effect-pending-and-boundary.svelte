<script>
  let n = $state(0);

  function reset() {
    n = 0;
  }
</script>

<svelte:boundary onerror={reset}>
  {#snippet pending()}
    <b>pending</b>
  {/snippet}

  <b>{n}</b>
</svelte:boundary>

<svelte:boundary>
  {#snippet failed(error, retry)}
    <button onclick={retry}>{String(error)}</button>
  {/snippet}

  {#snippet pending()}
    <b>waiting</b>
  {/snippet}

  <b>{n}</b>
</svelte:boundary>

<button onclick={() => (n += 1)}>{n}</button>
