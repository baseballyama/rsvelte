<script>
  let count = 0;
  $: doubled = count * 2;
  function inc() { count += 1; }
</script>
<button on:click={inc}>{count} {doubled}</button>