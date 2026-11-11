<script>
	export let a = 1
	let b = 2
	let c = 3

	$: doubled = a * 2
	$: sum =
		b +
		c
	$: quad = doubled
		* 2
	$: arrowed = () =>
		a + b
	$: {
		c = a
	}
	$: if (a > 1)
		b = a
	else
		b = 0
	$: label: for (const _ of [1]) break label
	$: console.log(
		a,
		b
	)
</script>

<p>{doubled}{sum}{quad}{arrowed()}{b}{c}</p>
