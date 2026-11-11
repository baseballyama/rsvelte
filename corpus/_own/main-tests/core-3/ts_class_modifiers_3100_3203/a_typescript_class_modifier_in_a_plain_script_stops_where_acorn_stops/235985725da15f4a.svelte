<script module>
	class C {
		accessor #a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
