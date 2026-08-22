<script>
	// $derived and $effect are only mentioned here
	const label = '$state';
	export let count;
	let total;
	$: {
		total = count * 2;
	}
</script>

{label}
{total}
