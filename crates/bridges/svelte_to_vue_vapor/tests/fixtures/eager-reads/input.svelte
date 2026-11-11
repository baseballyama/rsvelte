<script>
  let count = $state(0);
  const initial = $state.eager(count);
  let doubled = $derived($state.eager(count) * 2);
  let sampled = $state(0);
  function update() {
    count++;
    sampled = $state.eager(count);
  }
</script>
<button onclick={update}>increment</button>
<p>{initial}:{count}:{$state.eager(count)}:{doubled}:{sampled}</p>
