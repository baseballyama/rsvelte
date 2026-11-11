<script>
	let { a = ($bindable(1)) } = $props();
	let base = ($state(1));
	let raw = ($state.raw([1]));
	let doubled = ($derived(base * 2));
	let tripled = ($derived.by(() => base * 3));
	const uid = ($props.id());

	class K {
		f = ($state(1));
		g = ($derived(this.f + 1));
	}

	const k = new K();
</script>

<p>{a}{base}{raw[0]}{doubled}{tripled}{uid}{k.f}{k.g}</p>
