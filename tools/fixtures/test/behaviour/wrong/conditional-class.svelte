<script>
  let open = $state(false);
</script>

<button class="toggle" onclick={() => (open = !open)}>{open ? 'Hide' : 'Show'}</button>
{#if open}
  <p class="details">Details are visible.</p>
{:else}
  <p class="hint muted">Nothing to see.</p>
{/if}
