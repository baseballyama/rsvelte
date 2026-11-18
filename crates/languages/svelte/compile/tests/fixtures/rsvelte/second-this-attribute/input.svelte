<script>
	import C from './C.svelte';
	let tag = $state('div');
	let tag2 = $state('span');
</script>

<svelte:element this={tag} this={tag2}>x</svelte:element>
<svelte:component this={C} this={C} />
