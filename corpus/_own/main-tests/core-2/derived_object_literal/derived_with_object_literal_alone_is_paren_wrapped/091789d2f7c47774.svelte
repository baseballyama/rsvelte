<script>
  let a = $state(1);
  let b = $state(2);
  const obj = $derived({ a, b });
</script>
<pre>{JSON.stringify(obj)}</pre>