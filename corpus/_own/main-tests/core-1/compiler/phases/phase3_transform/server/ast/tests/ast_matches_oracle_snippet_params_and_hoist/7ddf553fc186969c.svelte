<script>
	let count = $state(0);
	function default_arg() { return 1; }
</script>

{#snippet item(id = default_arg())}
	<div>{id}</div>
{/snippet}

{@render item()}
