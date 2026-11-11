<script>
	let a = $state(1);
	let b = $state({ deep: true });

	$inspect(a, b);
	$inspect(a).with((type, value) => {
		if (type === 'update') console.warn(value);
	});
	$inspect(b).with(console.trace);

	$effect(() => {
		$inspect.trace('effect');
		void a;
	});
</script>

<button onclick={() => (a += 1)}>{a}:{b.deep}</button>
