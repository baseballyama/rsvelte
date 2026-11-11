<script lang="ts">
	class C {
		private get a() { return 1; }
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
