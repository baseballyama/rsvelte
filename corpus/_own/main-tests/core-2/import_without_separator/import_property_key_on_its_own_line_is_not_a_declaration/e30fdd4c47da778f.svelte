<script>
	const modules = import.meta.glob("./examples/*.svelte", {
		query: "?raw",
		import: "default",
		eager: true
	});
</script>

<b>{Object.keys(modules).length}</b>