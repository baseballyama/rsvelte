<script>
  let n = $state(0);
  let log = $state([]);

  $effect.pre(() => {
    log.push(`pre:${n}`);
  });

  $effect(() => {
    log.push(`post:${n}`);

    return () => {
      log.push("teardown");
    };
  });

  $effect(() => {
    const tracking = $effect.tracking();
    untracked(tracking);
  });

  function untracked(value) {
    return value;
  }

  const stop = $effect.root(() => {
    $effect.pre(() => {
      void n;
    });

    return () => {};
  });
</script>

<button onclick={() => (n += 1)}>{n}{log.length}</button>
<button onclick={stop}>stop</button>
