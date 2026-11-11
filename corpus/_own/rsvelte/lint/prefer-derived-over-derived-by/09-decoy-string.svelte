<script>
	let a = $state(1);
	const s = '$derived.by(() => 1)';
	const t = `x${a}$derived.by(() => 2)`;
	// $derived.by(() => 3)
	let real = $derived.by(() => s.length + t.length);
</script>

{real}
