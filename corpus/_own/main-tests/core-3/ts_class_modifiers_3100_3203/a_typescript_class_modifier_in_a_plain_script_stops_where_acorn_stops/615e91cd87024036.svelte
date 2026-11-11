<script module>
	class C {
		accessor [1] = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
