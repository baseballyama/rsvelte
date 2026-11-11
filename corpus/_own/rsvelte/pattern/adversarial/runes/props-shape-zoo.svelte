<script>
	let {
		a = 1,
		b = a + 1,
		bound = $bindable(4),
		boundNoDefault = $bindable(),
		children,
		...rest
	} = $props();

	let sum = $derived(a + b + bound);
</script>

<button onclick={() => (bound += 1)}>
	{sum}{Object.keys(rest).length}{boundNoDefault ?? '-'}{children ? 1 : 0}
</button>
