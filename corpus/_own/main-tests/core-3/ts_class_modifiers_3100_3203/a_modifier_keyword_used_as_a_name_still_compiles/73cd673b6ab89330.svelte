<script>
	class C {
		static { this.a = 1; }
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
