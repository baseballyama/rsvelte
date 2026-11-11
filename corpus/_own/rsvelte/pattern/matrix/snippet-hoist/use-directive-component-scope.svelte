<script>
	let label = $state('');

	function autofocus(node) {
		label = node.tagName;
	}
</script>

{#snippet field()}
	<input use:autofocus />
{/snippet}

{@render field()}
<p>{label}</p>
