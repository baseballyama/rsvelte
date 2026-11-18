<script>
	let d = 0;
	let e = 0;
	$: d = e;
	$: e = d + 1;
</script>
<b>{d}{e}</b>
