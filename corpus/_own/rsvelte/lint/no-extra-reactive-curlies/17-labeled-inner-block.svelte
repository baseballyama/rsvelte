<script>
	export let count;
	let total;
	$: outer: {
		total = count;
	}
	plain: {
		total = count;
	}
</script>

{total}
