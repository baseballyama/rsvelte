<script>
	let count = $state(0);
	let double = $derived(count * 2);

	$effect(() => {
		// runs when the component is mounted, and again
		// whenever `count` or `double` change,
		// after the DOM has been updated
		console.log({ count, double });

		return () => {
			// if a callback is provided, it will run
			// a) immediately before the effect re-runs
			// b) when the component is destroyed
			console.log('cleanup');
		};
	});
</script>

<button on:click={() => count++}>
	{double}
</button>

<p>{count} doubled is {double}</p>
