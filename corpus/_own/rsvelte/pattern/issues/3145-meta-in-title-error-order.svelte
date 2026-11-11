<script>
	let n = $state(1);
</script>

<svelte:head>
	<title>
		<svelte:window onresize={() => n++} />
	</title>
</svelte:head>
