<script>
	let options = { top: 'outer' };

	function fit() {
		const options = { top: '' };
		options.top = 'local';
		return options;
	}

	function move() {
		options.top = 'changed';
	}

	const fitted = fit();
</script>

<button on:click={move}>{options.top}: {fitted.top}</button>
