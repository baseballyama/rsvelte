<script>
	let { n = 5 } = $props();
	const Input = 1;
	console.log(Input);
</script>

{#if n === 0}
	<p>lift-off!</p>
{:else}
	<svelte:self n={n - 1} />
{/if}
