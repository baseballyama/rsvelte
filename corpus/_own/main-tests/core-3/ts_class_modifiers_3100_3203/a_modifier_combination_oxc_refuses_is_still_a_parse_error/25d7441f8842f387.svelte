<script>
	class C {
		readonly static a = 1;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
