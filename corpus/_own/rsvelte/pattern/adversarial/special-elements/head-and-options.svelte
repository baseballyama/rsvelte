<svelte:options css="injected" preserveWhitespace={false} />

<script>
	let title = $state('a');
	let desc = $state('b');
</script>

<svelte:head>
	<title>{title} — suffix</title>
	<meta name="description" content={desc} />
	{#if desc}
		<link rel="canonical" href="/{desc}" />
	{/if}
	<style>
		.head-scoped { color: red; }
	</style>
</svelte:head>

<button onclick={() => { title += 'a'; desc += 'b'; }}>{title}{desc}</button>
