<script>
  let { visible } = $props();
</script>

{#if visible}
  <div>Yes</div>
{:else}
  <div>No</div>
{/if}