<script>
	let ticks = 0;
	const qm = queueMicrotask;
	const qm2 = qm;
	$: qm2(() => {
		ticks = ticks + 1;
	});
</script>

{ticks}
