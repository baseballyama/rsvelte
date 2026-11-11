<script module>
	class C {
		accessor static a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
