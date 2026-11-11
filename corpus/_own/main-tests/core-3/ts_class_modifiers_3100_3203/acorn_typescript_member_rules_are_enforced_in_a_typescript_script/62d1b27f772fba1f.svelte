<script lang="ts">
	class C {
		abstract a;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
