<script module>
	class C {
		public a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
