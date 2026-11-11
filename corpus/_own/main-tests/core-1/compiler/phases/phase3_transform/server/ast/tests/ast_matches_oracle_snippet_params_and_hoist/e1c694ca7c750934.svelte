<script>
	let numbers = $state([1, 2, 3]);
</script>

<div>
	<div>
		{#snippet x(n)}
			<p>{n}</p>
		{/snippet}
		{#each numbers as n}
			{@render x(n)}
		{/each}
	</div>
</div>
