<script>
	let base = $state(1);
	let a = $derived(base + 1);
	let b = $derived(a * 2);
	let c = $derived.by(() => b - a);
	let d = $derived(c ? { c, sum: a + b + c } : null);
	let e = $derived(d?.sum ?? 0);

	class Holder {
		inner = $state(0);
		outer = $derived(this.inner + e);
	}

	const h = new Holder();
</script>

<button onclick={() => (base += 1)}>{e}:{h.outer}</button>
