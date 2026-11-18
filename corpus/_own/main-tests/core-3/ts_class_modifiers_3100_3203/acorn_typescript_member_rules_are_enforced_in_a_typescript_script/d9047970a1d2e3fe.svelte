<script lang="ts">
	class C {
		protected abstract a: number;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
