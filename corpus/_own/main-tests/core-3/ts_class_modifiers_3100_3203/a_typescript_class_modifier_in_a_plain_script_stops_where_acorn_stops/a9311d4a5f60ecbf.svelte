<script>
	class C {
		private async m() {}
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
