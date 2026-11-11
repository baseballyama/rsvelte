<script>
	class C {
		static private a = 1;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
