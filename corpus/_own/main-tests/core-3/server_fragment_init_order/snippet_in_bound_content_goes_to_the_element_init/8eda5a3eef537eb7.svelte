<script>
	import Child from './Child.svelte';
	let open = $state(null);
	let tag = $state('div');
	let p = $state(Promise.resolve(1));
</script>

<Child bind:value={() => open, (v) => (open = v)} /><div contenteditable bind:innerHTML={open}>{#snippet s()}<p>{open}</p>{/snippet}{@render s()}</div>
