<script>
	let a = $state(10);
	const half = a / 2;
	const re = /\$inspect\(/g;
	const also = half / 3;
	$inspect(also);
	void re;
</script>
<p>{a}</p>
