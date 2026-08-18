<script>
	export let count;
	let total;
	$: {
		total = count * 2;
	}
</script>

{total}
