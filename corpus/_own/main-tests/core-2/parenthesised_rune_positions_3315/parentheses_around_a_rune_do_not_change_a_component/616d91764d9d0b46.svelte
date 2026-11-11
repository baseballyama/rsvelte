<script>
	let base = $state(1);
	$effect(() => { console.log(base); });
</script>
<p>{base}</p>
