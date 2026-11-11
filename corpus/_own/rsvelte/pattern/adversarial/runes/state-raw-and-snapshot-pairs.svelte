<script>
  let deep = $state({ a: { b: 1 } });
  let raw = $state.raw({ a: { b: 1 } });
  const deepSnapshot = $derived($state.snapshot(deep));
  const rawSnapshot = $derived($state.snapshot(raw));

  function mutate() {
    deep.a.b += 1;
    raw = { a: { b: raw.a.b + 1 } };
  }
</script>

<button onclick={mutate}>m</button>
<b>{deep.a.b}{raw.a.b}</b>
<b>{deepSnapshot.a.b}{rawSnapshot.a.b}</b>
