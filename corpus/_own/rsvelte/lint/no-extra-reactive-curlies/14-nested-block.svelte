<script>
	export let count;
	let total;
	$: {
		{
			total = count;
		}
	}
</script>

{total}
