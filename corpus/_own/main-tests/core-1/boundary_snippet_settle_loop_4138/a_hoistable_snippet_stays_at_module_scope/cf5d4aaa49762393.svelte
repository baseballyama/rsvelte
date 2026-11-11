<script>
	let value = $state('');
</script>

{#snippet failed()}
	<p>failed</p>
{/snippet}

<Child bind:value />
{@render failed()}
