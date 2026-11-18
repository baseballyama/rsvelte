<script>
  let src = { a: { b: 1 }, c: [2, [3, 4]], d: { e: 5, f: 6 } };
  let b = 0;
  let x = 0;
  let y = 0;
  let z = 0;
  let e = 0;
  let rest = {};

  $: ({
    a: { b },
    c: [x, [y, z]],
    d: { e, ...rest },
  } = src);

  function reset() {
    src = { a: { b: 0 }, c: [0, [0, 0]], d: { e: 0 } };
  }
</script>

<button onclick={reset}>{b}{x}{y}{z}{e}{Object.keys(rest).length}</button>
