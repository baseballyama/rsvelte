<script>
	class C {
		override m() {}
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
