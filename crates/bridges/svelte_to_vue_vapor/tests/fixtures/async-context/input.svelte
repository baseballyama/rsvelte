<script>
  const initial = await Promise.resolve(2);
  const uid = $props.id();
  let count = $state(initial);
</script>
<button onclick={() => count++}>change</button>
<p>{uid.length > 0}:{count}</p>
