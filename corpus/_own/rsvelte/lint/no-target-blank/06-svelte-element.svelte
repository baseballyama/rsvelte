<script>
  let tag = 'a';
</script>

<svelte:element this={tag} href="https://example.com/" target="_blank">dynamic element</svelte:element>
<svelte:element this={'a'} href="https://example.com/" target="_blank" rel="noopener noreferrer">secure</svelte:element>
