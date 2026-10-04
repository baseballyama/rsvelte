<script>
  let key = $state('a');
  let object = $state({ a: 1, b: 2, c: 3 });
  let { [key]: selected, ...rest } = $derived(object);
</script>
<button onclick={() => key = key === 'a' ? 'b' : 'a'}>key</button>
<button onclick={() => object.b++}>value</button>
<p>{selected}:{JSON.stringify(rest)}</p>
