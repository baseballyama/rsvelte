<script>
	let n = $state(1);
</script>

<slot>
	<svelte:head>
		<title>{n}</title>
	</svelte:head>
</slot>
