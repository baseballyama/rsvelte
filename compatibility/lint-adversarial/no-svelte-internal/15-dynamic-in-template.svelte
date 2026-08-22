<script>
	const load = () => import('svelte/internal/client');
</script>

{#await import('svelte/internal')}
	<p>loading</p>
{:then mod}
	<p>{typeof mod}</p>
{/await}

<button onclick={() => import('svelte/internal/server')}>{typeof load}</button>
