<script>
  let n = $state(0);

  $effect(() => {
    console.log(n);
  });

  $effect.pre(() => console.log(n));

  function f() {
    $effect(() => {});
    return 1;
  }
</script>

<button onclick={() => n++}>{n} {f()}</button>
