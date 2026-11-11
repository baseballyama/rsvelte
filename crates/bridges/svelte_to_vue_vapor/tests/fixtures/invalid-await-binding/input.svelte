<script>
  let value = $state('');
</script>
<input bind:value={(await Promise.resolve({ value })).value} />
