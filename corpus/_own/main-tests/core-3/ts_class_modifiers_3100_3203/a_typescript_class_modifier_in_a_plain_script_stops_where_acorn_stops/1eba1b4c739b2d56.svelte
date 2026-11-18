<script module>
	class C {
		public static readonly a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
