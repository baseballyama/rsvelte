<script>
  let x = foo(1); let z = 2;
  function go() { x = 2 }
</script>

<p on:click={go}>{x}{z}</p>
