<script>
	let { header, footer } = $props();
	let cond = $state(true);
</script>

{#snippet fallback()}
	<p>fallback</p>
{/snippet}

{@render header?.()}
{@render (footer ?? fallback)()}
{@render (cond ? fallback : footer ?? fallback)()}
