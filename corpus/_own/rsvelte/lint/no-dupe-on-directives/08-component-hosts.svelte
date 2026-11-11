<script>
	import C from './01-basic.svelte';
	let h = () => {};
</script>

<C on:go={h} on:go={h} />
<svelte:component this={C} on:go={h} on:go={h} />
{#if false}
	<svelte:self on:x={h} on:x={h} />
{/if}
