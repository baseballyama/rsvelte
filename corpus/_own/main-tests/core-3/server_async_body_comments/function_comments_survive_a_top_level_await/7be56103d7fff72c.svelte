<script>
	const top = await load();
	async function f() {
		const r = /** @type {R} */ (await load());
		return /* c */ await other();
	}
	let x = /* init */ 1;
</script>
<p>{top}{f}{x}</p>
