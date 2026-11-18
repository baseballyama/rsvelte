<script>
	let ticks = 0;
	$: setInterval(() => {
		ticks = ticks + 1;
	}, 1000);
</script>

{ticks}
