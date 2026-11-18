<script module>
	class C {
		readonly static a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
