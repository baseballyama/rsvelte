<script>
  let n = $state(0);

  function inFunction() {
    $effect(() => {
      void n;
    });
  }

  class Holder {
    value = $state(1);

    constructor() {
      $effect(() => {
        void this.value;
      });
    }
  }

  $effect(() => {
    if (n > 0) {
      $effect(() => {
        void n;
      });
    }
  });

  $effect(() => {
    const cleanup = () => {};
    try {
      void n;
    } finally {
      void 0;
    }
    return cleanup;
  });

  const holder = new Holder();
</script>

<button onclick={inFunction}>{n}{holder.value}</button>
