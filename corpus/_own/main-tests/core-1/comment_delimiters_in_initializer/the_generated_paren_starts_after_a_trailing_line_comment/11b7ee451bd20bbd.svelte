<script>
  let x = foo(1) // ; c
  function go() { x = 2 }
</script>

<p on:click={go}>{x}</p>
