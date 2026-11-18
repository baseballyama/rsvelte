<script>
	function greeting() {
		return 'outer';
	}

	let open = $state(true);
</script>

{#if open}
	{#snippet greeting()}<b>hi</b>{/snippet}
	<div data-x={greeting}>x</div>
{/if}
