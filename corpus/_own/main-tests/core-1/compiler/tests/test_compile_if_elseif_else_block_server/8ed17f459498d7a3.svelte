<script>
  let { value } = $props();
</script>

{#if value === 1}
  <div>One</div>
{:else if value === 2}
  <div>Two</div>
{:else}
  <div>Other</div>
{/if}