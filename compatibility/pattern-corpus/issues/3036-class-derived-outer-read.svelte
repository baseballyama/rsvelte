<script>
	let base = $state(1);
	let e = $derived(base + 1);

	class Holder {
		inner = $state(0);
		outer = $derived(this.inner + e);
	}

	const h = new Holder();
</script>

<button onclick={() => (base += 1)}>{e}:{h.outer}</button>
