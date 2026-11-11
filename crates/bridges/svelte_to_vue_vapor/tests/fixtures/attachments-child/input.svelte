<script>
  let { children, ...props } = $props();
</script>
<button {...props}>{@render children?.()}</button>
<output>{Object.keys(props).join(',')}:{Object.getOwnPropertySymbols(props).length}</output>
