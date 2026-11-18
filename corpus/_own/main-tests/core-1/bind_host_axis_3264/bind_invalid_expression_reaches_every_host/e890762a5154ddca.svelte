<script>
	import C from './C.svelte';
	let v = $state('a');
	let o = $state({ k: 1 });
	let tag = $state('div');
	let el = $state(null);
	let n = $state(0);
</script>
{#if n}<svelte:self bind:value={o?.k} />{/if}