<script module>
	class C {
		static accessor a = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
