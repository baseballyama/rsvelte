<script>
	let a = $state(1);
	const r = /\$inspect\(a\)/;

	function f(a) {
		console.log(a);
		console.log(console.error(a));
	}

	console.log(r);
	f(2);
</script>

<b>{a}</b>
