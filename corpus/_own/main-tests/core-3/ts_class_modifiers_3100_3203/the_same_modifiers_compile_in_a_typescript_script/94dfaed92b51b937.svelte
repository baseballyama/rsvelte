<script lang="ts">
	class C {
		declare a: number;
	}
	const s = C;
</script>

<p>{s ? 'ok' : ''}</p>
