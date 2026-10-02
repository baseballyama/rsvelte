<script>
  // Vue passes attributes it has no prop for to the single root element, merging `class`.
  let { class: className, ...rest } = $props();
</script>

<p class={['inner', className]} {...rest}>root</p>
