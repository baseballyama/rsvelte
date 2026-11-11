<script>
	async function f() {
		const r = /** @type {R} */ (await load());
		return /* c */ await other();
	}
</script>
<p>{f}</p>
