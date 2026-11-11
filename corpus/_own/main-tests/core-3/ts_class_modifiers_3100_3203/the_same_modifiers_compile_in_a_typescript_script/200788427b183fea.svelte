<script lang="ts">
	class C {
		readonly a = 1;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
