<script>
  let a = $state(0);
  let b = $state(0);

  function go() {
    [a, b] = ["\\", 2];
  }
</script>

<button onclick={go}>{a}{b}</button>
