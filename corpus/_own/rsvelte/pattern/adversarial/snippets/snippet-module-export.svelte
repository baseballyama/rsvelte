<script module>
	export { badge };
</script>

{#snippet badge(text)}
	<span class="badge">{text}</span>
{/snippet}

{@render badge('local use')}

<style>
	.badge {
		border: 1px solid;
	}
</style>
