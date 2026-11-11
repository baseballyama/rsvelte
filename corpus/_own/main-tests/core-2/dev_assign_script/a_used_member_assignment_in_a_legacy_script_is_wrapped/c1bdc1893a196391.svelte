<script>
	export let duration = 4000;

	function show(props) {
		const key = { props };
		return new Promise((resolve) => (key.resolveExpiredPromise = resolve));
	}
</script>

<button onclick={() => show({})}>{duration}</button>
