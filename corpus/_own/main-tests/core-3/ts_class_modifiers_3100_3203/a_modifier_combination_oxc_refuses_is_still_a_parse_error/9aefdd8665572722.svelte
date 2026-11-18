<script module>
	class C {
		static private a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
