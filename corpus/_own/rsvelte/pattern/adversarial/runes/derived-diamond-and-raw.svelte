<script>
  let seed = $state(1);
  let raw = $state.raw({ list: [1] });

  const left = $derived(seed * 2);
  const right = $derived(seed + 1);
  const bottom = $derived(left + right);
  const throughRaw = $derived(raw.list.length + bottom);
  const chained = $derived.by(() => {
    const inner = throughRaw * 2;
    return inner - bottom;
  });
  const snapshotted = $derived($state.snapshot(raw));

  function bump() {
    seed += 1;
    raw = { list: [...raw.list, seed] };
  }
</script>

<b>{left}{right}{bottom}</b>
<b>{throughRaw}{chained}</b>
<b>{snapshotted.list.length}</b>
<button onclick={bump}>{seed}</button>
