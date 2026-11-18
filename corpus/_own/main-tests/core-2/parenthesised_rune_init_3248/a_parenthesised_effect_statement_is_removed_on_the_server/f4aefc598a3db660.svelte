<script>
	let base = $state(1);
	($effect(() => { void base; }));
</script>
<div>{base}</div>
