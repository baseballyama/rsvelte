<script module>
	class C {
		private m() {}
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
