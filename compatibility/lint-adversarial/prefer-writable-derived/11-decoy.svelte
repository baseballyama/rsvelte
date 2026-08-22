<script>
	let src = $state(0);
	let plain = 0;
	const doc = '$effect(() => { plain = 1; })';
	// $effect(() => { plain = 2; })
	$effect(() => {
		plain = src + doc.length;
	});
</script>

{plain}
