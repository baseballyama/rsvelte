<script>
  let tree = $state({ list: [{ id: 1 }], table: { nested: { count: 0 } } });
  let n = $state(0);

  $inspect(n);
  $inspect(n, tree);
  $inspect(tree.table.nested.count).with((type, value) => {
    void type;
    void value;
  });
  $inspect(n).with(console.log);

  function snapshot() {
    const outer = $state.snapshot(tree);
    const inner = $state.snapshot(tree.table);
    const nested = $state.snapshot({ wrapped: $state.snapshot(tree.list) });
    return [outer, inner, nested].length;
  }
</script>

<b>{snapshot()}</b>
<button onclick={() => (n += 1)}>{n}</button>
