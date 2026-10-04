<script>
  let { label = 'child', ...rest } = $props();
  let doubled = $derived(rest.count * 2);
  function keys() { return Object.keys(rest).sort().join(','); }
</script>
<p>{label}/{rest.count}/{doubled}/{keys()}</p>
