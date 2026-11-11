<script>
  let value = $state(1);
</script>
<button onclick={() => value++}>change</button>
<input value={await Promise.resolve(value)} />
<p class:active={await Promise.resolve(value % 2 === 1)} style:color={await Promise.resolve(value % 2 ? 'red' : 'blue')}>{value}</p>
