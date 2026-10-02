<script>
  // An absent Boolean prop is false in Vue, not undefined.
  let { flag = false, shown = false } = $props();
</script>

<p>flag {String(flag)}, shown {String(shown)}</p>
