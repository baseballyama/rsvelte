<script>
	import C from './C.svelte';
	let v = $state('a');
	let o = $state({ k: 1 });
	let tag = $state('div');
	let n = $state(0);
	const p = Promise.resolve(1);
</script>
<svelte:element this={tag} bind:this={o[await p]}>x</svelte:element>