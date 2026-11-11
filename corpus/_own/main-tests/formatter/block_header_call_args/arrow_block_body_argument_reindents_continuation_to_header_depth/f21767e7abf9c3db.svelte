<script>
	let depA = 1;
	let depB = 2;
	function run() {}
	function useEffect(fn, deps) {}
</script>

{#if a}
	{#if b}
		{#if useEffect(() => { run(); }, [depA, depB])}
			<div>x</div>
		{/if}
	{/if}
{/if}
