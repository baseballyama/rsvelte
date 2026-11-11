<script lang="ts">
	class C {
		private async m() {}
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
