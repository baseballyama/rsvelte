<script>
	export let a = 1;
	let b = 0;
	// c
	$: b = a * 2;
</script>

<p>{b}</p>
