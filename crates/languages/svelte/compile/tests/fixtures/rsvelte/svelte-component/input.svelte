<script>
	import A from './A.svelte';
	let { depth = 0, other } = $props();
	let current = $state(A);
</script>

<svelte:component this={current} label="x" {depth} />
<svelte:component this={other ?? A}>text {depth}</svelte:component>
{#if depth < 3}
	<svelte:self depth={depth + 1} />
{/if}
