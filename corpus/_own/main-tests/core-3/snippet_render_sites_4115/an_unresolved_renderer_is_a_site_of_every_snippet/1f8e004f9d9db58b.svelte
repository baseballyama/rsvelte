<script>
	let alias = row;
</script>
{#snippet row()}<span>x</span>{/snippet}
<div class="aliased">{@render alias()}</div>
<div class="never"></div>
<style>
	.aliased span { color: red; }
	.never span { color: blue; }
</style>
