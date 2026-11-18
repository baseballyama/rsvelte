<script module>
	function tooltip() {
		return () => {};
	}
</script>

<script>
	let count = $state(0);
</script>

{#snippet badge()}
	<span {@attach tooltip()}>badge</span>
{/snippet}

{@render badge()}
<p>{count}</p>
