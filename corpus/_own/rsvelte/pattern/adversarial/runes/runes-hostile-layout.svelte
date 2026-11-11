<script>
	let a = $state(
		1
	)
	let b = $state(2), c = $derived(b + 1)
	let d = $derived
		.by(() => a + b)
	let { p = 1, ...rest } = $props()
	let e = $state
	(3)

	const f = () =>
		a + b

	$effect(() =>
	{
		a
	})

	function g() { return a }
</script>

<p>{a}{b}{c}{d}{p}{Object.keys(rest).length}{e}{f()}{g()}</p>
