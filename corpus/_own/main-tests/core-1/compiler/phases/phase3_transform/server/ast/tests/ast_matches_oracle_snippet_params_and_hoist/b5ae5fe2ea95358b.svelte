<script>
	let count = $state(0);
	let other = $state(0);
</script>

{#snippet foo({ count }, { other })}
	<p>{count} {other}</p>
{/snippet}

{@render foo({ count }, { other })}
