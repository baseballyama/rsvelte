<script>
	let { title } = $props();
</script>

<h1>{title}</h1>

{#if title}
	{@const title = () => 'shadowed'}
	<p>{title}</p>
{/if}
