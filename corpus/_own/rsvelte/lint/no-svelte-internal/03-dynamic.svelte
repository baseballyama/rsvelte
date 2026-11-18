<script>
	async function inFunction() {
		return import('svelte/internal');
	}
	const eager = Promise.all([import('svelte/internal/client')]);
	function nonLiteral(p) {
		return import(p);
	}
	void [inFunction, eager, nonLiteral];
</script>
<p>dynamic</p>
