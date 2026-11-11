<script module>
	class C {
		private a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
