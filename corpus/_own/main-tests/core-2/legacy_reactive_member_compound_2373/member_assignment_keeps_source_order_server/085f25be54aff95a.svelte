<script>
	let x = 1;
	let obj = { x: 0 };
	let a = 0;
	$: a = x * 2;
	$: obj.x = 1;
</script>

<p>{a} {obj.x}</p>
