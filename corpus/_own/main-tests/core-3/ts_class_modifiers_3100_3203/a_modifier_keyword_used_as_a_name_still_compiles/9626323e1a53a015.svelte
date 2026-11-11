<script module>
	class C {
		declare = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
