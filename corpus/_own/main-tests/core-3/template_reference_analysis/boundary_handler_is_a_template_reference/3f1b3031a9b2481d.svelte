<svelte:boundary onerror={handle_error}>
  <p>content</p>
</svelte:boundary>
<script>
function handle_error(error) {
  console.error(error);
}
</script>