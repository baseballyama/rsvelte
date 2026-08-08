<script>
  let n = $state(0);
  const quotes = /'|"/g;
  function bump() {
    n += 1;
  }
</script>

<button onclick={bump}>{quotes.source}{n}</button>
