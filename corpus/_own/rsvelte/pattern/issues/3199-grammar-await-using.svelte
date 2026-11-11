<script>
	async function scoped() {
		await using resource = {
			async [Symbol.asyncDispose]() {},
		};
		return resource;
	}

	const pending = scoped();
</script>

<b>{typeof pending}</b>
