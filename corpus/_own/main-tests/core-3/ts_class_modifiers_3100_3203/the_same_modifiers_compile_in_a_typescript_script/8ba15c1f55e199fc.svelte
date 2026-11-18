<script lang="ts">
	class C {
		private a = 1;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
