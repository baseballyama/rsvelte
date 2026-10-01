<script>
  let { label = 'count', start = 0, step = 1 } = $props();
  // svelte-ignore state_referenced_locally
  let count = $state(start);
</script>

<button class="bump" onclick={() => (count += step)}>{label}: {count}</button>
