<script>
  let count = $state(0);
</script>

<button on:click="{() => count++}">
  clicks: {count}
</button>
