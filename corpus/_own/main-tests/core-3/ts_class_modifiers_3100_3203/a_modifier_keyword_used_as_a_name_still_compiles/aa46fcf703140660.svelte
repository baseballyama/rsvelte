<script module>
	class C {
		static readonly = 1;
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
