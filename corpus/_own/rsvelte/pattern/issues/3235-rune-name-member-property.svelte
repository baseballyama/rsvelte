<script>
	const o = {
		$state: (v) => v,
		$derived: (v) => v,
		$effect: (f) => f,
		$inspect: (v) => v
	};

	const a = o.$state(1);
	const b = o.$derived(2);
	const c = o.$effect(() => {});
	const d = o.$inspect(3);
</script>

<div>{a} {b} {c} {d}</div>
