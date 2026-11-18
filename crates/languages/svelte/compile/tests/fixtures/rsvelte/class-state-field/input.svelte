<script>
	class Counter {
		count = $state(0);
	}

	const counter = new Counter();
</script>

<button onclick={() => counter.count++}>{counter.count}</button>
