<script>
  let source = $state({ user: { name: 'Ada' }, list: [1, 2, 3] });
  const { user: { name }, list: [first, ...rest] } = source;
  const [number, fallback = 4] = [2];
</script>
<button onclick={() => { source.user.name = 'Grace'; source.list[0]++; }}>change</button>
<p>{name}:{first}:{rest.join(',')}:{number}:{fallback}</p>
<strong>{source.user.name}:{source.list[0]}</strong>
