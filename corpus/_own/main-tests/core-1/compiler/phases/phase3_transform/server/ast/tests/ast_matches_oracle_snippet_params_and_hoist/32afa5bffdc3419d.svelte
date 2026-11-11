<script>
	let count = $state(0);
</script>

{#snippet foo({ count })}
	<p>clicks: {count}</p>
{/snippet}

{@render foo({ count })}
