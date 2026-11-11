<script>
	const top = await load();
	async function f() {
		const r = /** @type {R} */ (await load());
		return /* c */ await other();
	}
	// line comment outside
	let x = /* init */ 1;
</script>
<p>{top}{f}{x}</p>
