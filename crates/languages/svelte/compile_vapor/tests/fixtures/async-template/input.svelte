<script>
  let a = $state(1);
  let b = $state(2);
  async function add(a, b) { return a + b; }
  const worker = { async double(value) { return value * this.factor; }, factor: 2 };
</script>
<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<p>{a} + {b} = {await add(a, b)}</p>
<strong>{await worker.double(a)}</strong>
<span>{(await Promise.resolve(a)) + b}</span>
