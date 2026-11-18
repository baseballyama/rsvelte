<script lang="ts">
	class C {
		abstract a: number;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
