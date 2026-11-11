<script>
	import Comp from './Comp.svelte';
</script>
{#snippet row()}<b>y</b>{/snippet}
{#snippet other()}<span>x</span>{/snippet}
<div class="wrap"><Comp foo={row} /></div>
<style>
	.wrap span { color: red; }
</style>
