<script>
	export let duration = 4000;

	function show(key) {
		key.done = duration;
	}
</script>

<button onclick={() => show({})}>{duration}</button>
