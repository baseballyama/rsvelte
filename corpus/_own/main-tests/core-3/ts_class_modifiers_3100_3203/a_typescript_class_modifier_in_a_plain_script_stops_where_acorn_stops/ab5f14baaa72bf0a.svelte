<script module>
	class C {
		private static a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
