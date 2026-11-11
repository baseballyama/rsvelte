<script module>
	class C {
		readonly a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
