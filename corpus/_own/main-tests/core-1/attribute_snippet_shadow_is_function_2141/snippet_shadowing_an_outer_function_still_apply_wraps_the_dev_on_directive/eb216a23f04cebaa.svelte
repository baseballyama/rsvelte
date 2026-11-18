<script>
	function greeting() { return 'outer'; }
	let open = $state(true);
</script>
{#if open}
	{#snippet greeting()}<b>hi</b>{/snippet}
	<button on:click={greeting}>x</button>
{/if}