<script>
	import C from './C.svelte';

	let { depth = 0 } = $props();
</script>

<svelte:component this={C}>
	<svelte:self depth={depth + 1} />
</svelte:component>
