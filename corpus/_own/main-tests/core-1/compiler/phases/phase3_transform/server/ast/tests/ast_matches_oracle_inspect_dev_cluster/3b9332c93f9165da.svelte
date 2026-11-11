<script>
	let a = $state(0);
	$inspect(a).with((...args)=>{
		console.log(...args);
	});
</script>
<p>{a}</p>