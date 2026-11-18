<script module>
	class C {
		private get a() { return 1; }
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
