<script>
	const s = "window.addEventListener('x', f)";
	// addEventListener('y', g)
	const re = /addEventListener\(/;
	const tpl = `addEventListener('z', ${s})`;

	function real() {
		globalThis.addEventListener('a', () => {});
	}
</script>

<p>{s} {re.source} {tpl} {typeof real}</p>
