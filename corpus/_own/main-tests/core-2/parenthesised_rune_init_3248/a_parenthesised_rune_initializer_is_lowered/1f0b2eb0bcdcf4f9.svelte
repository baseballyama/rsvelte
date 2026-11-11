<script>
	let base = $state(1);
	let v = ($derived.by(() => base * 2));
</script>
<div>{base}{v}</div>
