<script module>
	class C {
		private() {}
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
