<script>
	let a = $state({ b: 0 });
	let c = $state({ d: 0 });
	let e = $state({ v: 1 });
	const f = (g) => (g(), 1);
</script>

<button onclick={() => (a.b = f(() => (c.d = e)))}>go</button>
