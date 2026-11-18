<script>
	import C from './C.svelte';
	let el = $state(null);
	let tag = $state('div');
	let tag2 = $state('span');
	let v = $state(1);
	let n = $state(0);
</script>
<svelte:component this={C} this={C} />