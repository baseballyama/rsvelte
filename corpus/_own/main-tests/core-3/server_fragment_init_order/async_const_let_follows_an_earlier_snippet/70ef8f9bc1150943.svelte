<script>
	import Child from './Child.svelte';
	let open = $state(null);
	let tag = $state('div');
	let p = $state(Promise.resolve(1));
</script>

{#if open}{#snippet s()}<i>{open}</i>{/snippet}{@const a = await p}<Child bind:value={() => a, (v) => (open = v)} />{@render s()}{/if}
