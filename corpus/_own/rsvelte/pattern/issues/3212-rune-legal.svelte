<script>
	let v = $state(1);
</script>

{#if v}
	{@const c = $state.snapshot(v)}
	<b>{c}</b>
{/if}
