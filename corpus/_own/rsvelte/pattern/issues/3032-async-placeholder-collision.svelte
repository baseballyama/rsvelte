<script>
	let ready = $state(false);
	const marker = '$$async_hole';
	const other = `$$async_noop and ${marker} /* $$inspect_hole */`;

	async function load() {
		await Promise.resolve();
		ready = other.includes(marker);
	}
</script>

<button onclick={load}>{ready}</button>
