<script>
	export let data;
	const region = data.props?.region || null;
	let c = 0;
	$: d = c * 2;
</script>

<svelte:head>
	<title>{region ? `Cities in ${region.name}` : 'Cities'}</title>
</svelte:head>
<button on:click={() => c++}>{d}</button>
