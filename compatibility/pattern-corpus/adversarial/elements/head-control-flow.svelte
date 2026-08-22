<script>
	let title = $state('page');
	let metas = $state([{ name: 'a', content: '1' }]);
	let raw = $state('<meta name="raw" content="r">');
</script>

<svelte:head>
	<title>{title} — site</title>
	{#if title.length > 2}
		<meta name="long" content={title} />
	{/if}
	{#each metas as m (m.name)}
		<meta name={m.name} content={m.content} />
	{/each}
	{@html raw}
	<link rel="canonical" href="/p/{title}" />
</svelte:head>

<p>{title}</p>
