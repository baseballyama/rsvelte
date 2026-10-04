<script>
  let props = $props();
  let total = $derived(props.count + 1);
</script>
<p>{props.count}/{props.label}/{total}/{Object.keys(props).sort().join(',')}</p>
