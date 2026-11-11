<script>
	class C {
		private *g() {}
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
