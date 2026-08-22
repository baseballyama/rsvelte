<script>
  let n = $state(1);
  const d = $derived(n * 2);

  $effect(() => {
    $inspect.trace("label");
    void d;
  });

  function tracked() {
    return $effect.tracking();
  }

  $inspect(n, d).with((type) => {
    void type;
  });
</script>

<button onclick={() => (n += 1)}>{n}{d}</button>
<b>{tracked()}</b>
