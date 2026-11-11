<script>
  let n = 0;
  function go() {
    n++
    n = n * 2
  }
</script>

<p on:click={go}>{n}</p>
