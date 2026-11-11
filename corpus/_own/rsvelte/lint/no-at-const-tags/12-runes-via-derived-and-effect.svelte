<script>
	let n = 1;
	const doubled = $derived(n * 2);
	$effect(() => {
		void doubled;
	});
</script>

{#if doubled}
	{@const half = doubled / 2}
	<span>{half}</span>
{/if}
