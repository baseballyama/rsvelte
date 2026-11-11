<script>
	async function f() {
		return import(`svelte/internal`);
	}
	void f;
</script>
<p>template literal specifier is not a Literal upstream</p>
