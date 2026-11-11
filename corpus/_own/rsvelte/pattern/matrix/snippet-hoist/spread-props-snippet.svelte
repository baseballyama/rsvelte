<script>
	let { label, ...rest } = $props();
</script>

{#snippet chip()}
	<span {...rest}>{label}</span>
{/snippet}

{@render chip()}
