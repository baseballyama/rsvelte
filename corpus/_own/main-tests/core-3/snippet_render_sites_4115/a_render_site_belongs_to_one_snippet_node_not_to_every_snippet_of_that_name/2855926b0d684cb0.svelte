<script>
	import Comp from './Comp.svelte';
</script>
{#snippet row()}<span>outer</span>{/snippet}
<div class="wrap">{#snippet row()}<b>inner</b>{/snippet}{@render row()}</div>
<Comp>{#snippet row()}<i>passed</i>{/snippet}</Comp>
<style>
	.wrap span { color: red; }
	.wrap b { color: green; }
	.wrap i { color: blue; }
</style>
