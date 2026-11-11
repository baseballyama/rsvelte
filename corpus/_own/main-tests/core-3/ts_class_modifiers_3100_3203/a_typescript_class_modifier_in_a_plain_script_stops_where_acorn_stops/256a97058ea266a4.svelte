<script module>
	class C {
		protected a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
