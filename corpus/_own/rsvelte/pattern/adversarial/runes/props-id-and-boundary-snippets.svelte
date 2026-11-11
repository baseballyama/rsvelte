<script>
  let a = $props.id();
  let caught = $state(false);
</script>

<svelte:boundary onerror={() => (caught = true)}>
  <b id={a}>{a}</b>

  {#snippet failed(error, reset)}
    <button onclick={reset}>{error.message}</button>
  {/snippet}
</svelte:boundary>

<b>{caught}</b>
