<script>
	let { title = 'x', desc = '' } = $props();
	const meta = [
		{ name: 'a', content: '1' },
		{ name: 'b', content: '2' }
	];
</script>

<svelte:head>
	<title>{title} &mdash; {desc || 'untitled'}</title>
	{#each meta as m (m.name)}
		<meta name={m.name} content={m.content} />
	{/each}
	{#if desc}
		<meta name="description" content={desc} />
	{:else}
		<!-- no description -->
		<link rel="canonical" href="/{title}" />
	{/if}
	{#key title}
		<meta property="og:title" content={title} />
	{/key}
	<style>
		.head-scoped {
			color: red;
		}
	</style>
</svelte:head>

<h1 class="head-scoped">{title}</h1>
