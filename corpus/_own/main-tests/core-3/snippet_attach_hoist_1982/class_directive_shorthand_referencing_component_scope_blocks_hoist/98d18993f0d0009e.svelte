<script>
	let active = $state(false);
</script>

{#snippet warning()}
	<li class:active>x</li>
{/snippet}

{@render warning()}