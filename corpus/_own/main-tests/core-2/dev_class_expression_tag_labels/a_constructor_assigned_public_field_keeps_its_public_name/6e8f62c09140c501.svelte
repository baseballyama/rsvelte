<script>
	const counter = new class Counter {
		constructor() {
			this.count = $state(0);
		}
	}
</script>

<p>{counter.count}</p>
