<script>
	class Counter {
		n = $state(1);
		v = $derived.by(() => this.n * 2);
	}
	const c = new Counter();
</script>

{c.v}
