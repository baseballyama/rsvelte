<script>
	class C {
		get private() { return 1; }
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
