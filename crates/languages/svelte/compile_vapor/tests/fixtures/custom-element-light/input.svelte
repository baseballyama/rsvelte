<svelte:options customElement={{ tag: 'rsvelte-light', shadow: 'none' }} />
<script>
  let count = $state(0);
  function increment() {
    count++;
    $host().setAttribute('data-count', String(count));
  }
</script>
<button onclick={increment}>count {count}</button>
<style>
  button { color: rgb(4, 5, 6); font-size: 21px; }
</style>
