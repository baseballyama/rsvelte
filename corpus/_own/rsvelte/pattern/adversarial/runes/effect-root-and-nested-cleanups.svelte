<script>
  let n = $state(0);

  const stopOuter = $effect.root(() => {
    const stopInner = $effect.root(() => {
      $effect(() => {
        void n;
        return () => {};
      });
      return () => {};
    });

    $effect.pre(() => {
      void n;
      return () => stopInner();
    });

    return () => {};
  });

  function stop() {
    stopOuter();
  }
</script>

<button onclick={stop}>{n}</button>
