<script>
	import C from './C.svelte';
	let el = $state(null);
	let v = $state('v');
	let tag = $state('div');
	let tag2 = $state('span');
	let o = $state({ k: 1 });
	let rest = $state({});
</script>
<svelte:element this={tag} bind:this={el} bind:this={el}>x</svelte:element>