<script>
	let { name } = $props();
	const site = 'Zoo';
	let count = $state(3);
</script>

<svelte:head>
	<title>{site} — {name} ({count})</title>
	<meta name="description" content="{site}: {name}" />
	<link rel="canonical" href={`https://x.test/${name}`} />
</svelte:head>
<button onclick={() => count++}>{count}</button>
