<script>
	let n = $state(0)
	let s = $state('x')
	const twice = $derived(n * 2)
	const late = $derived.by(() =>
		twice + s.length
	)
	function go() {
		n++
		s += '!'
	}
	$effect(() => {
		console.log(late)
	})
</script>

<button onclick={go}>{late}</button>
