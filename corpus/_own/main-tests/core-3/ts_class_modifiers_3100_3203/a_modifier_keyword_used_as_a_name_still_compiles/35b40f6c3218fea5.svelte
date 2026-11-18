<script module>
	class C {
		override = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
