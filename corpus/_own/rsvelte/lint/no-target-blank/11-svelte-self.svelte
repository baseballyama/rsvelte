<script>
  let deep = false;
</script>

{#if deep}
  <svelte:self href="https://example.com/" target="_blank" />
{/if}
