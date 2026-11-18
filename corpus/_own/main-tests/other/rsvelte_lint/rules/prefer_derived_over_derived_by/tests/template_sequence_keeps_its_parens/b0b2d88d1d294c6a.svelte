<script>
	let a = $state(1);
	let b = $state(2);
</script>

{$derived.by(() => (a, b))}
