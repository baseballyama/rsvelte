<script>
	import Child from './Child.svelte';
	import Grand from './Grand.svelte';

	export let shared = '';
	let mid;

	$: upper = (shared ?? '').toUpperCase();
</script>

<Child bind:value={shared} bind:this={mid}>
	<Grand bind:inner={shared} label={upper} />
</Child>

<svelte:component this={Child} bind:value={shared} />
