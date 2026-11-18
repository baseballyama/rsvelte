<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  function inc() { let step = 1; count += step; }
</script>
<button onclick={inc}>{count} / {doubled}</button>
<style>button { color: red; }</style>