<script>
  let alpha = $state(0);
  let beta = $state(0);
  let table = $state({ nested: { deep: 0 } });

  function write() {
    alpha =
      beta * 100 +
      alpha * 200 +
      beta * 300 +
      alpha * 400 +
      beta * 500 +
      alpha * 6;
    table.nested.deep =
      beta * 100 +
      alpha * 200 +
      beta * 300 +
      alpha * 400 +
      beta * 500 +
      alpha * 6;
    table.nested = {
      deep: beta * 100 + alpha * 200 + beta * 300 + alpha * 400 + beta * 500,
    };
    alpha +=
      beta * 100 +
      alpha * 200 +
      beta * 300 +
      alpha * 400 +
      beta * 500 +
      alpha * 6;
    [alpha, beta] = [
      beta * 100 + alpha * 200 + beta * 300 + alpha * 400,
      alpha * 100 + beta * 200 + alpha * 300 + beta * 400,
    ];
  }
</script>

<b>{alpha}{beta}{table.nested.deep}</b>
<button onclick={write}>go</button>
