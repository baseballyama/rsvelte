<script lang="ts">
	let { color } = $props();
</script>
<p>{color}</p>
<style lang="scss">
	@mixin m($color) { color: $color; }
</style>