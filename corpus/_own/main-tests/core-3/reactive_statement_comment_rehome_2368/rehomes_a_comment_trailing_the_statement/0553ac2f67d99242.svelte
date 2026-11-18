<script>
	let count = 1;
	let double;
	$: double = count * 2; // this too
	let z = 1;
	console.log(z, double);
</script>