<script>
	let a = 1;
	let b = 0;
	$: {
		/* inner */
		b = a;
	}
</script>
{b}