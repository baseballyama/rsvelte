<script>
  let x = a + // ; c
    b
  function go() { x = 2 }
</script>

<p on:click={go}>{x}</p>
