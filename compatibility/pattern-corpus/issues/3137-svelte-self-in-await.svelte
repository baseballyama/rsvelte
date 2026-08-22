<script>
	let { depth = 0 } = $props();
	const p = Promise.resolve(1);
</script>

{#await p then v}
	<svelte:self depth={depth + 1} />
	<b>{v}</b>
{/await}
