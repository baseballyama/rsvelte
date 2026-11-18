<script>
	let d = 0;
	$: {
		let x = 1;
		d += x;
	}
</script>

<b>{d}</b>
