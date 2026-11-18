<svelte:options css="injected" />
<script>
  let count = $state(0);
</script>
<svelte:head><title>injected {count}</title><meta name="injected" content={count} /></svelte:head>
<button onclick={() => count++}>count {count}</button>
<style>
  button { color: rgb(7, 8, 9); font-size: 23px; }
</style>
