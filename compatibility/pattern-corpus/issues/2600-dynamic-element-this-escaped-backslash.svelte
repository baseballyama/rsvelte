<script>
  let sep = "/";
  let n = 1;
</script>

<svelte:element this={sep === "\\" ? "b" : "i"}><span>{n}</span></svelte:element
>
