<script>
	let active = $state(false);
</script>

{#snippet tab()}
	<div class:active>tab</div>
{/snippet}

{@render tab()}
