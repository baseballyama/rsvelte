<script>
	export let a = 1;
	let b;
	$: b = a * 2;
	// tail
</script>
<div>{b}</div>