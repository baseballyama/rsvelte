<script>
	import Child from './Child.svelte';
	let open = $state(null);
	let tag = $state('div');
	let p = $state(Promise.resolve(1));
</script>

<svelte:head><title>{open}</title><Child bind:value={() => open, (v) => (open = v)} /></svelte:head>
