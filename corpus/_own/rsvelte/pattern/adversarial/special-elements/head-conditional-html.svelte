<script>
	let title = $state('t');
	const meta = [{ name: 'a', content: '1' }];
	let raw = $state('<meta name="raw" content="2" />');
</script>

<svelte:head>
	<title>{title} — {meta.length}</title>
	{#each meta as m (m.name)}
		<meta name={m.name} content={m.content} />
	{/each}
	{#if title}
		<link rel="canonical" href="/{title}" />
	{:else}
		<link rel="canonical" href="/" />
	{/if}
	{@html raw}
	<style>
		.head-scoped {
			color: red;
		}
	</style>
</svelte:head>

<h1 class="head-scoped">{title}</h1>
