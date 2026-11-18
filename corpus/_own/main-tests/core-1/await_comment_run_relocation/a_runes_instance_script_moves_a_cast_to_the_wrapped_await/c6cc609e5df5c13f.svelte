<script>
	let x = $state(1);
	async function f() {
		return /** @type {T} */ (await g());
	}
</script>
<p>{x}{f}</p>