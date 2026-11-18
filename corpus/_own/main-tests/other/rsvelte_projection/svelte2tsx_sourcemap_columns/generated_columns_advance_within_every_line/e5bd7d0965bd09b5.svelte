<script lang="ts">
  let count = 0;
  const label = "件数";
  function increment() {
    count += 1;
  }
</script>

<button on:click={increment}>{label}: {count}</button>
