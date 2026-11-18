<script>
	let a = $state(1);
	let v = $derived.by(() => {
		return a * 2;
	});
</script>

{v}
