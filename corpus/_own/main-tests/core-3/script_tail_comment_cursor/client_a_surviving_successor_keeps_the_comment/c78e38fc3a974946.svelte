<script>
	export let a = 1;
	let b;
	$: b = a * 2;
	// tail
	let z = 1;
</script>
<div>{b}{z}</div>