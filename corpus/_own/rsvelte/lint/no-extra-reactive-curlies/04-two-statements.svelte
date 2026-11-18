<script>
	export let count;
	let a, b;
	$: {
		a = count + 1;
		b = a * 2;
	}
</script>

{a}{b}
