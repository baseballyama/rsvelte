<script>
  let containerWidth = 0
  let label = ''

  $: {
    void containerWidth
  }

  $: {
    label = String(containerWidth)
    void containerWidth
  }

  function onResize (w) {
    if (w !== containerWidth) containerWidth = w
  }
</script>

<button onclick={() => onResize(1)}>{label}</button>
