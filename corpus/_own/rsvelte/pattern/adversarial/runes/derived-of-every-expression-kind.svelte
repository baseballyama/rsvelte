<script>
  let n = $state(2);
  let s = $state("a");
  let o = $state({ k: 1 });
  let list = $state([1, 2]);

  const binary = $derived(n + 1);
  const unary = $derived(-n);
  const logical = $derived(n && 1);
  const nullish = $derived(o.missing ?? 0);
  const conditional = $derived(n > 1 ? s : "b");
  const template = $derived(`${s}${n}`);
  const member = $derived(o.k);
  const computed = $derived(list[n - 2]);
  const call = $derived(list.at(0));
  const object = $derived({ n, s });
  const array = $derived([n, s]);
  const spread = $derived([...list, n]);
  const sequence = $derived((n, s));
  const optional = $derived(o?.k);
  const newed = $derived(new Set([n]));
  const tagged = $derived(String.raw`x${n}`);
</script>

<button onclick={() => (n += 1)}>b</button>
<b>{binary}{unary}{logical}{nullish}</b>
<b>{conditional}{template}{member}{computed}</b>
<b>{call}{object.n}{array[0]}{spread.length}</b>
<b>{sequence}{optional}{newed.size}{tagged}</b>
