<script>
	let count = $state(0);

	$inspect(count, (count, type) => {
		if (type === 'update') {
			debugger; // or `console.trace`, or whatever you want
		}
	});
</script>

<button onclick={() => count++}>Increment</button>
