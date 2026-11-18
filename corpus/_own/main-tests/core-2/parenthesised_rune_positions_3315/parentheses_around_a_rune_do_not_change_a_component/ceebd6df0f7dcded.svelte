<script>
	let base = $state(1);
	let d = (
	  $derived.by(() => base + 1)
	);
</script>
<p>{base}</p>
