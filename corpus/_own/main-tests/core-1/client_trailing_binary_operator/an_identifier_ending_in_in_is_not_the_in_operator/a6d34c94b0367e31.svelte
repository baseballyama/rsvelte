<script>
  let margin = 1;
  let scaled = margin
  let other = 2;
  function go() { other = 3; scaled = 4 }
</script>

<p on:click={go}>{scaled}{other}</p>
