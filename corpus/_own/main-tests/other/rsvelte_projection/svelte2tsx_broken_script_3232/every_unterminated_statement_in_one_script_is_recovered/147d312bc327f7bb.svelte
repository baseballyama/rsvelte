<script>
	export let a = 1;
	let b = 1 let c = 2
	let d = 3 let e = 4
	$: {
		b = a c = b
	}
</script>

<b>{a}{b}{c}{d}{e}</b>
