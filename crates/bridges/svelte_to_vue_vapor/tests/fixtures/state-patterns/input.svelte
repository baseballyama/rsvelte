<script>
  let { n = 1, deep: { value = 2 }, list: [first = 3, ...remaining], ...rest } = $state({ deep: {}, list: [undefined, 4, 5], unused: 6 });
  let [a, , ...tail] = $state.raw([10, 20, 30]);
  let { read = () => n } = $state({});
</script>
<button onclick={() => { n++; value++; remaining.push(6); }}>deep</button>
<button onclick={() => { a++; tail = [...tail, 40]; }}>raw</button>
<p>{n}:{value}:{first}:{remaining.join(',')}:{JSON.stringify(rest)}</p>
<output>{a}:{tail.join(',')}:{read()}</output>
