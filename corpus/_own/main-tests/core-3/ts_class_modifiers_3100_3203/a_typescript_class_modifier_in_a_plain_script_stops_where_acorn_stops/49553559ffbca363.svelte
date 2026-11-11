<script module>
	class C {
		private *g() {}
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
