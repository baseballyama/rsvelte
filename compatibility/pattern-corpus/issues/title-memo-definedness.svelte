<script>
	let value = $state('value');

	function format(input) {
		return input;
	}
</script>

<svelte:head>
	<title>{format(value)} — {format('suffix')}</title>
</svelte:head>
