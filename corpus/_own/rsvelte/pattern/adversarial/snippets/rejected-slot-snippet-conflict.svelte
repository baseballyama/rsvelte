<script>
	let rows = $state([{ id: 1, tags: ['a'] }]);
</script>

<div>
	<slot name="row" {rows} first={rows[0]} />
	<slot let:unused />
</div>

{#snippet unusedSnippet()}
	<i>x</i>
{/snippet}

{@render unusedSnippet()}

