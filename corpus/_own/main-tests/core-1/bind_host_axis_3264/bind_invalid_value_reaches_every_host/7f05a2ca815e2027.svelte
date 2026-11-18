<script>
	import C from './C.svelte';
	let v = $state('a');
	let o = $state({ k: 1 });
	let tag = $state('div');
	let el = $state(null);
	let n = $state(0);
</script>
<svelte:element this={tag} bind:offsetHeight>x</svelte:element>