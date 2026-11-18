<svelte:options namespace="svg" />
<script>
  let { radius = 10 } = $props();
</script>
<circle r={radius} fill="var(--fill)" />
