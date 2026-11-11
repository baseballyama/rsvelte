<script module>
	class C {
		private async m() {}
	}
	export const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
