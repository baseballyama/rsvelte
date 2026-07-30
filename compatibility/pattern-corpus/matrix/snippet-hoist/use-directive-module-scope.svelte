<script module>
	export function autofocus(node) {
		node.focus();
	}
</script>

{#snippet field()}
	<input use:autofocus />
{/snippet}

{@render field()}
