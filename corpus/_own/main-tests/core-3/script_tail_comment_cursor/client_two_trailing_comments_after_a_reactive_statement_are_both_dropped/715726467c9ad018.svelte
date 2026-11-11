<script>
	export let a = 1;
	let b;
	$: b = a * 2;
	// one
	// two
</script>
<div>{b}</div>