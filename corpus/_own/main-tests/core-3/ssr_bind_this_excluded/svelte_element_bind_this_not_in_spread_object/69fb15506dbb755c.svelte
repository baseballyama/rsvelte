<script>
let ref = $state(null);
let tag = $state('div');
let restProps = {};
</script>
<svelte:element this={tag} bind:this={ref} tabindex={0} {...restProps} />