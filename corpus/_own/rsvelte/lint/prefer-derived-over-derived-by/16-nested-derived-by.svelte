<script>
	let a = $state(1);
	let v = $derived.by(() => $derived.by(() => a));
</script>

{v}
