<script>
	let { title, ...rest } = $props();
	const named = $$slots.header ? 'with' : 'without';
</script>

{#if $$slots.header}
	<header><slot name="header" /></header>
{/if}
<h1 {...rest}>{title} {named}</h1>
<slot />
