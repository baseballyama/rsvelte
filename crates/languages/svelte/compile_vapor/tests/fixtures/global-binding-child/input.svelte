<script>
  let { label = 'child' } = $props();
  let width = $state();
</script>
<svelte:window bind:innerWidth={width} />
<p>{label}/{width}</p>
