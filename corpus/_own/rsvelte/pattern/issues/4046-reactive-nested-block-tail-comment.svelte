<script>
	export let a = 1;
	let b = 0;
	$: if (b > 2) {
		console.log(b);
	}
	/* tail */
</script>

<p>{b}{a}</p>
