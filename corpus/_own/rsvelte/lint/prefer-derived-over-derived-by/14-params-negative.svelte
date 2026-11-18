<script>
	let a = $state(1);
	let v1 = $derived.by((x) => a);
	let v2 = $derived.by((x = 1) => a);
	let v3 = $derived.by((...rest) => a);
	let v4 = $derived.by(function (x) {
		return a;
	});
</script>

{v1}{v2}{v3}{v4}
