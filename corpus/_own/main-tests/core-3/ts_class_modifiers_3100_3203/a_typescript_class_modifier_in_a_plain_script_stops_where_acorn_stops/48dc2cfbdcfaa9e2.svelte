<script>
	class C {
		accessor [1] = 1;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
