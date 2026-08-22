<script>
	let a = $state(1);
	let v = $derived.by(() => ({ x: a }));
</script>

{v.x}
