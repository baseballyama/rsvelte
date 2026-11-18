<script>
	let count = $state(0);
	function action(node) {
		count++;
	}
</script>

{#snippet warning()}
	<li use:action>x</li>
{/snippet}

{@render warning()}