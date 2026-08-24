<script>
	let total = 0;
	for (let r = $state(4); total < 4; total += 1) {
		total += r;
	}
</script>

<p>{total}</p>
