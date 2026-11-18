<script module>
	class C {
		declare a;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
