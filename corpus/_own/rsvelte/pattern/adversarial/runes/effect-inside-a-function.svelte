<script>
  let n = $state(0);

  function setup() {
    $effect(() => {
      void n;
    });

    $effect.pre(() => {
      void n;
    });

    return $effect.root(() => {
      $effect(() => {
        void n;
      });

      return () => {};
    });
  }

  const stop = setup();

  function nested() {
    function inner() {
      $effect(() => {
        void n;
      });
    }

    inner();
  }
</script>

<button onclick={() => (n += 1)}>{n}</button>
<button onclick={nested}>a</button>
<button onclick={stop}>b</button>
