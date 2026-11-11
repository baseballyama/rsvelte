<script>
	let a = $state(1);
	const fns = [() => a];
	let v1 = $derived.by(() => a, 1);
	let v2 = $derived.by();
	let v3 = $derived.by(...fns);
	void fns;
</script>

{v1}{v2}{v3}
