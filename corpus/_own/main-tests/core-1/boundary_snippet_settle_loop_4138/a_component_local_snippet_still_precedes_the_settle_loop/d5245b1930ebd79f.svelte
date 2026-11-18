<script>
	let value = $state('');
	let label = 'x';
</script>

{#snippet failed()}
	<p>{label}</p>
{/snippet}

<Child bind:value />
{@render failed()}
