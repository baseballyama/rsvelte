<script>
	let a = 0;
	let b = 0;
	$: Promise.resolve(a).then(function () {
		a = a + 1;
	});
	$: Promise.resolve(b).then(() => {
		b = b + 1;
	});
</script>

{a}{b}
