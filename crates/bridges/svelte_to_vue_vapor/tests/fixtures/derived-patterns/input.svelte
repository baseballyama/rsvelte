<script>
  let source = $state({ a: 1, b: 2, nested: { x: 3 }, list: [4, 5, 6], extra: 7 });
  let { a, b: renamed, nested: { x }, list: [first, , ...tail], missing: fallback = a + 10, ...rest } = $derived(source);
  let [double, read] = $derived.by(() => [source.a * 2, () => source.b]);
</script>
<button onclick={() => source.a++}>a</button>
<button onclick={() => source.b++}>b</button>
<button onclick={() => a = 100}>override</button>
<button onclick={() => source.list.push(8)}>list</button>
<p>{a}:{renamed}:{x}:{first}:{tail.join(',')}:{fallback}</p>
<output>{double}:{read()}:{JSON.stringify(rest)}</output>
