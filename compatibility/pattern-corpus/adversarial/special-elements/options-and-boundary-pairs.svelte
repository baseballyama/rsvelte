<svelte:options namespace="html" css="injected" />

<script>
  let value = $state(1);
</script>

<svelte:boundary>
  <b>{value}</b>

  {#snippet pending()}
    <b>p</b>
  {/snippet}

  {#snippet failed(error)}
    <b>{error.message}</b>
  {/snippet}
</svelte:boundary>

<style>
  b {
    color: red;
  }
</style>
