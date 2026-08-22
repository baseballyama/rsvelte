<script>
	export let count;
	let total;
	$: if (count) {
		total = count;
	}
</script>

{total}
