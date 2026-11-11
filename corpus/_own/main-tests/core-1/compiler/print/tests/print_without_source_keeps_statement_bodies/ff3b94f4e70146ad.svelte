<script>
	let count = 0;
	$: doubled = count * 2;
	const f = () => {
		count += 1;
		return count;
	};
</script>