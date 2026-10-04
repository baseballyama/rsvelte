<script>
  const uid = $props.id();
  const original = uid;
  let count = $state(0);
</script>
<button onclick={() => count++}>update</button>
<p>{typeof uid === 'string'}:{uid.length > 0}:{uid === original}:{count}</p>
