<script>
	let count = 0;
	$: Promise.resolve(count).then(() => {
		count = count + 1;
	});
</script>

{count}
