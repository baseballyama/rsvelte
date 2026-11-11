<script>
	let count = $state(0);

	function onRendered() {
		count++;
		return () => {
			count--;
		};
	}
</script>

{#snippet warning()}
	<li {@attach () => onRendered()}>x</li>
{/snippet}

{@render warning()}
