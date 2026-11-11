<script>
  let x = 1;
  function go() {
    // values.forEach((v) => (valueFilter[v] = true));
    x = 2;
  }
</script>

<p on:click={go}>{x}</p>
