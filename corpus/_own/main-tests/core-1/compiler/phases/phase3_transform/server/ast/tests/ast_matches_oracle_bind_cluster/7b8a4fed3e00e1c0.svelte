<script>
	import ComponentA from './ComponentA.svelte';
	let type = $state(ComponentA);
	let elem = $state.raw();
</script>

<svelte:component this={type} bind:this={elem}>Content</svelte:component>
