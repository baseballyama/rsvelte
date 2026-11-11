<script>
  let a = $state(0);
  let b = $state(0);
  function pull(obj) {
    ({ x: a, y: b } = obj);
  }
</script>
<button onclick={() => pull({ x: 1, y: 2 })}>go</button>