<script>
  let a = $state(1);
  let b = $state(2);
  const c = $derived(a + b);
  const d = $derived.by(() => a * b);
  let e = $state.raw({ k: 1 });

  // A declarator whose value starts on the next line.
  let f = $state(3);
  const g = $derived(f + 1);
</script>

<b>{a}{b}{c}{d}{e.k}{f}{g}</b>
