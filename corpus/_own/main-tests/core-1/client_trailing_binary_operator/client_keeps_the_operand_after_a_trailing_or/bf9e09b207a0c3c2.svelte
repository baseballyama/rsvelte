<script>
  let flag = foo(1) !== undefined ||
    foo(2) !== undefined
  function go() { flag = true }
</script>

<p on:click={go}>{flag}</p>
