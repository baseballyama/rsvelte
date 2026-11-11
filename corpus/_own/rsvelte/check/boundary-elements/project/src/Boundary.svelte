<script lang="ts">
	function report(e: unknown) {
		console.error(e);
	}
</script>

<svelte:boundary onerror={(e) => report(e)}>
	content
	{#snippet failed()}
		<p>failed</p>
	{/snippet}
</svelte:boundary>
