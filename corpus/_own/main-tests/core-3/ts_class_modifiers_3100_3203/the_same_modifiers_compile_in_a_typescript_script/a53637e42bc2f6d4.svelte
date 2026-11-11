<script lang="ts">
	class C {
		private readonly a = 1;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
