<script lang="ts">
  function handle(e) {
    if (e.key === 'Enter' && !e.isComposing) {
      const element = modal.querySelector('a[data-has-node]') as HTMLElement | undefined;
      element?.click();
    }
  }
</script>