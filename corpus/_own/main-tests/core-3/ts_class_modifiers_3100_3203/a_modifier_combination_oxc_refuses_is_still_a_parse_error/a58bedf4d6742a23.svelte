<script>
	class C {
		declare accessor a;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
