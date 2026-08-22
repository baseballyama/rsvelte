<script>
	let a = 1;
	const $derived = {
		by(fn) {
			return fn();
		}
	};
	let v = $derived.by(() => a + 1);
</script>

{v}
