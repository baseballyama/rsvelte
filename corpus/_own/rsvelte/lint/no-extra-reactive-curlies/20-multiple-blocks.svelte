<script>
	export let count;
	let a, b;
	$: {
		a = count;
	}
	$: b = a;
	$: {
		b = a + 1;
	}
</script>

{a}{b}
