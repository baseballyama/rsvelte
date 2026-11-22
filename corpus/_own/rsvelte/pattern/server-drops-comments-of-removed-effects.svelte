<script>
	let count = $state(0);

	// kept: before the effect
	$effect(() => {
		/* @__PURE__ */ console.log(count); // dropped with the effect
	});

	$effect.pre(() => {
		// dropped with the pre effect
		count;
	});

	const stop = $effect.root(() => {
		/** dropped with the root effect */
		return () => {};
	});

	function track() {
		$inspect.trace(); // dropped with the trace
		/* kept: after the trace */
		return count;
	}
	// kept: after the effects
</script>

<button onclick={() => count++}>{track()}</button>
