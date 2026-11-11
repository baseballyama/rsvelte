<script>
	import Child from './Child.svelte';

	export let refs = {};
	export let rows = [];
</script>

<Child bind:this={refs['computed']} />

{#each rows as row, i}
	<div bind:this={refs[i]}>{row}</div>
{/each}
