<script>
  const sym = Symbol("k");

  let store = $state({
    plain: 1,
    [sym]: 2,
    nested: { deep: { list: [1, 2] } },
    get computed() {
      return this.plain * 2;
    },
    set computed(next) {
      this.plain = next;
    },
  });

  let map = $state(new Map([["a", 1]]));
  let set = $state(new Set([1]));

  function mutate() {
    store.nested.deep.list.push(3);
    store.computed = 5;
    map.set("b", 2);
    set.add(2);
  }
</script>

<button onclick={mutate}>m</button>
<b>{store.plain}{store[sym]}</b>
<b>{store.nested.deep.list.length}</b>
<b>{map.size}{set.size}</b>
