<script>
	let pending = $state(1);
</script>

{#snippet body(/* parameter */ value)}{value}{/snippet}
{@render body(pending)}
