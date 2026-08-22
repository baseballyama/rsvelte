<script>
  let tag = 'div';
</script>

<svelte:element this={tag} style:bogus-prop="1">on svelte:element, flag</svelte:element>
<svelte:element this={tag} style:color="red">on svelte:element known, ok</svelte:element>
