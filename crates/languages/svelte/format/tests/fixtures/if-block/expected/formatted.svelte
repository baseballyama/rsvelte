<script>
  let { ok } = $props();
</script>

{#if ok}
  <p>yes</p>
{:else}
  <p>no</p>
{/if}
