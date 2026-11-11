<script module>
	class C {
		override m() {}
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
