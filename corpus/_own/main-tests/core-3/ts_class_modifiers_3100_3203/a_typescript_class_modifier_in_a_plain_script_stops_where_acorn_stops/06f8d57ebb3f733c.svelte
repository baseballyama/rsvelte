<script>
	class C {
		private m() {}
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
