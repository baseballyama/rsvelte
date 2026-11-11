<script>
	let total = 0;
	$: globalThis.setTimeout(() => {
		total = total + 1;
	});
</script>

{total}
