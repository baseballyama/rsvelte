<script>
  let n = $state(0);

  $effect(() => {
    const id = n;
    return () => {
      void id;
    };
  });

  $effect(() => {
    if (n > 0) {
      return () => {};
    }
  });

  $effect.pre(() => {
    void n;
  });

  const stop = $effect.root(() => {
    $effect(() => {
      void n;
    });
    return () => {};
  });

  function tracked() {
    return $effect.tracking();
  }
</script>

<button onclick={() => (n += 1)}>{n}</button>
<b>{tracked()}</b>
<b>{typeof stop}</b>
