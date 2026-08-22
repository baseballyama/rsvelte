<script>
	let count = $state(0);
	const docs = [
		'$.set(count, 1) is internal',
		'$.prop($$props, "x")',
		'$.proxy wraps objects',
		'$.state and $.derived are runtime imports',
		'$.get(count) reads a signal',
		'$.update(count) increments',
	];

	function bump() {
		count += 1;
	}
</script>

<button onclick={bump}>{count}:{docs.length}</button>
