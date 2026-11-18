<script>
	let count = 0;
	function bump() {
		setTimeout(() => {
			count = count + 1;
		});
	}
	$: if (count >= 0) bump();
</script>

{count}
