<svelte:options namespace="svg" runes={true} />
<script>
  let circle = $state();
  let observed = $state('');
  $effect(() => { if (circle) observed = circle.namespaceURI; });
</script>
<circle bind:this={circle} cx="4" cy="4" r="3" />
<text>{observed}</text>
