<script>
  let { A = 'default', camelCase = 'fallback', onChange = () => {} } = $props();
</script>
<button onclick={() => onChange(A)}>{A}:{camelCase}</button>
