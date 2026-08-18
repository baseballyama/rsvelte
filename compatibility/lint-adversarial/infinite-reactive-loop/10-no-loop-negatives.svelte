<script>
	let a = 0;
	let b = 0;
	const msg = `queueMicrotask(() => { b = ${b} })`;
	$: a = b + 1;
	$: {
		void b;
		const local = () => {
			b = 42;
		};
		void local;
	}
</script>

{a}{msg}
