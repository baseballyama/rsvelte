<script>
	import Comp from './Comp.svelte';
</script>
<div class="wrap"><Comp>{#snippet row()}<span>x</span>{/snippet}</Comp></div>
<style>
	.wrap span { color: red; }
</style>
