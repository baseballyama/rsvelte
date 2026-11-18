<script>
	let a = $state(undefined);
	let b = $state(void 0);
	let c = $state(null);
	let d = $state();
</script>

<p>{a ?? 'a'}{b ?? 'b'}{c ?? 'c'}{d ?? 'd'}</p>
