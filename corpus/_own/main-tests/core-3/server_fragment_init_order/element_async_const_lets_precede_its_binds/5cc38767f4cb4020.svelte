<script>
	import Child from './Child.svelte';
	let open = $state(null);
	let tag = $state('div');
	let p = $state(Promise.resolve(1));
</script>

<div>{const x = await p}<Child bind:value={() => x, (v) => (open = v)} /></div>
