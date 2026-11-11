<script>
	const missing = undefined;
	let written = $state('a');

	function bump() {
		written += 'b';
	}
</script>

<svelte:head>
	<title>{missing}</title>
</svelte:head>

<button onclick={bump}>{written}</button>
