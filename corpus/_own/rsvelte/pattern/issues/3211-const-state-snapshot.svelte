<script>
	let v = $state('V');
</script>

{#if v}
	{@const c = $state.snapshot({ a: 1 })}
	<b>{c.a}</b>
{/if}
