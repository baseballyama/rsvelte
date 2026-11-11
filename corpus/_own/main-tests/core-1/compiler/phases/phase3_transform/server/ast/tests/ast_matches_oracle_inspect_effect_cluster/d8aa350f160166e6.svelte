<script>
	let s = $state(0);
	let d = $derived(s)
	$effect(() => { s; })
	$effect(() => { d; })
</script>
<h1>{s}</h1>