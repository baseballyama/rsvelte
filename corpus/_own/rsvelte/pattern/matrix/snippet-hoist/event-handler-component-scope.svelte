<script>
	let count = $state(0);

	function bump() {
		count += 1;
	}
</script>

{#snippet trigger()}
	<button onclick={bump}>{count}</button>
{/snippet}

{@render trigger()}
