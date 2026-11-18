<script>
	class C {
		static readonly = 1;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
