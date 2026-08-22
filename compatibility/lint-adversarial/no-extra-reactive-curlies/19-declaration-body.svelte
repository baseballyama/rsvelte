<script>
	export let count;
	let total;
	$: {
		const w = count * 2;
		total = w;
	}
	$: {
		const solo = count;
	}
	$: {
		let z = count, y = z;
	}
</script>

{total}
