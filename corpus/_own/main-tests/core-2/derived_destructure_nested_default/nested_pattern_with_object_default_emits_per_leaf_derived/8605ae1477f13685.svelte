<script>
  let { node } = $props();
  let {
    measured: { width: measuredWidth, height: measuredHeight } = { width: 0, height: 0 },
  } = $derived(node);
</script>
<p>{measuredWidth} {measuredHeight}</p>