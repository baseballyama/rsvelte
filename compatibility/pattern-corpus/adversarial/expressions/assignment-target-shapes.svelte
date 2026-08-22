<script>
  let o = $state({ a: 1, list: [1], nested: { deep: 1 } });
  let x = $state(1);
  let y = $state(2);
  const key = "a";

  function run() {
    o.a = 2;
    o[key] = 3;
    o["a"] = 4;
    o.list[0] = 5;
    o.nested.deep = 6;
    [x, y] = [y, x];
    ({ a: x } = o);
    ({
      nested: { deep: y },
    } = o);
    [x = 7] = [];
    [, y = 8] = [1];
    o.list.length = 1;
  }
</script>

<button onclick={run}>r</button>
<b>{o.a}{o.list[0]}{o.nested.deep}{x}{y}</b>
