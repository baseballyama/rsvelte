<script>
  let { node } = $props();
  let {
    measured: { width: measuredWidth } = { width: 0 },
  } = $derived(node);
</script>
<p>{measuredWidth}</p>