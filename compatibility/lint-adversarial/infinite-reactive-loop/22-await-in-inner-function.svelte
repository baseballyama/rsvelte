<script>
	let v = 0;
	let w = 0;
	const inner = async () => {
		await Promise.resolve();
		v = v + 1;
	};
	$: inner();
	$: (async () => {
		await Promise.resolve();
		w = w + 1;
	})();
</script>

{v}{w}
