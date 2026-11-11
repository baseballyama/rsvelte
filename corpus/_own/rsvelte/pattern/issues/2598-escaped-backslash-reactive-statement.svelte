<script>
	const separators = ['/', '\\'];
	let count = 0;
	let doubled = 0;
	$: doubled = count * 2;
</script>

<p>{separators.length}{count}{doubled}</p>
