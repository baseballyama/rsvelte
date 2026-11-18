<script>
	let { name = 'x' } = $props();
</script>

<div>
	<slot />
	<slot name="header" label={name} count={2}>
		<span>header fallback</span>
	</slot>
	<slot name="footer">
		<span>footer fallback {name}</span>
	</slot>
</div>

{#if $$slots.header}
	<p>has header</p>
{/if}
{#if $$slots['footer']}
	<p>has footer</p>
{/if}
