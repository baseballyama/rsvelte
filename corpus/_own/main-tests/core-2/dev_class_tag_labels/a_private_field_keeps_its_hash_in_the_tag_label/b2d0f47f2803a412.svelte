<script>
	class Counter {
		count = $state(0);
		#count = $state(1);
		get secret() { return this.#count; }
	}
	const c = new Counter();
</script>
<p>{c.count}{c.secret}</p>
