<script>
	let { ref = $bindable() } = $props();

	function observe(read, apply) {
		apply(read());
	}

	function setup(value) {
		const ref = $derived(value);
		const distance = $derived(1);

		observe(
			() => [ref, distance],
			([ref, distance]) => console.log(ref, distance)
		);
	}

	setup(1);
</script>

<div bind:this={ref}></div>
