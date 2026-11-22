<script>
	let { title, description } = $props();
</script>

<svelte:head>
	<meta name="description" content={description} />
	<title>{title} | site</title>
	<link rel="canonical" href="/{title}" />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
</svelte:head>

<h1>{title}</h1>
