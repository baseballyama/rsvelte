<script>
	let data = 0;
	$: Promise.resolve(data).then(() => {
		try {
			JSON.parse('x');
		} catch (data) {
			data = { recovered: true };
		}
	});
</script>

{data}
