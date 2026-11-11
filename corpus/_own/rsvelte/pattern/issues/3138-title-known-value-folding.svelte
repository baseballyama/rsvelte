<script>
	const zero = 0;
	let written = $state('a');

	function bump() {
		written += 'b';
	}
</script>

<svelte:head>
	<title>{zero}</title>
</svelte:head>

<button onclick={bump}>{written}</button>
