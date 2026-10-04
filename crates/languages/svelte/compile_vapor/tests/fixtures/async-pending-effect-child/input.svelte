<script>
  const { value, work = (value) => Promise.resolve(value * 2) } = $props();
  let observed = $state(-1);
  $effect(() => { observed = $effect.pending(); });
</script>
<p>{value}:{await work(value)}</p>
<small>{observed}</small>
