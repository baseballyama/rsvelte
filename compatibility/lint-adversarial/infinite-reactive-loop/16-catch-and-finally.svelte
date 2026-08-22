<script>
	let a = 0;
	let b = 0;
	$: Promise.reject(a).catch(() => {
		a = a + 1;
	});
	$: Promise.resolve(b).finally(() => {
		b = b + 1;
	});
</script>

{a}{b}
