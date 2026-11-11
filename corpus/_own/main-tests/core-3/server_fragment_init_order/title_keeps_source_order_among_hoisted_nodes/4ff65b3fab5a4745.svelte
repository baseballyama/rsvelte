<script>
	import Child from './Child.svelte';
	let open = $state(null);
	let tag = $state('div');
	let p = $state(Promise.resolve(1));
</script>

<svelte:head>{#if open}<title>{open}</title>{@const t = open}<Child bind:value={() => t, (v) => (open = v)} />{/if}</svelte:head>
