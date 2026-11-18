<script>
	import C from './C.svelte';
	let el = $state(null);
	let v = $state('v');
	let tag = $state('div');
	let tag2 = $state('span');
	let o = $state({ k: 1 });
	let rest = $state({});
</script>
<svelte:element this={tag} bind:contentRect>x</svelte:element>