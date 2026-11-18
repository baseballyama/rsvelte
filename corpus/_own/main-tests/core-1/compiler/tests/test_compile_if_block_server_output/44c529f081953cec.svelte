<script>
  let { visible } = $props();
</script>

{#if visible}
  <div>Visible!</div>
{:else}
  <div>Hidden</div>
{/if}