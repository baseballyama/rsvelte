<script>
	class Counter {
		#count = $state(0);
		get count() { return this.#count; }
		set count(val) { this.#count = val; }
	}
	const c = new Counter();
</script>

<p>{c.count}</p>
