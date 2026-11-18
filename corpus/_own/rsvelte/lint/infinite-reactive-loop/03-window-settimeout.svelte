<script>
	let total = 0;
	$: window.setTimeout(() => {
		total = total + 1;
	});
</script>

{total}
